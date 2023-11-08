import { Request as JWTRequest } from 'express-jwt'
import { Fiscalite, FiscaliteFrance, FiscaliteGuyane, fiscaliteVisible, isFiscaliteGuyane } from 'camino-common/src/fiscalite.js'
import { ICommune, IContenuValeur, IEntreprise } from '../../types'
import { HTTP_STATUS } from 'camino-common/src/http.js'

import {
  apiOpenfiscaCalculate,
  OpenfiscaRequest,
  OpenfiscaResponse,
  redevanceCommunale,
  redevanceDepartementale,
  substanceFiscaleToInput,
  openfiscaSubstanceFiscaleUnite,
} from '../../tools/api-openfisca/index.js'
import { titresGet } from '../../database/queries/titres.js'
import { titresActivitesGet } from '../../database/queries/titres-activites.js'
import { entrepriseGet, entrepriseUpsert } from '../../database/queries/entreprises.js'
import TitresActivites from '../../database/models/titres-activites.js'
import Titres from '../../database/models/titres.js'
import { CustomResponse } from './express-type.js'
import { SubstanceFiscale, substancesFiscalesBySubstanceLegale } from 'camino-common/src/static/substancesFiscales.js'
import { Departements, toDepartementId } from 'camino-common/src/static/departement.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { Regions } from 'camino-common/src/static/region.js'
import { anneePrecedente, caminoAnneeToNumber, isAnnee } from 'camino-common/src/date.js'
import {
  entrepriseIdValidator,
  entrepriseModificationValidator,
  EntrepriseType,
  sirenValidator,
  EntrepriseDocument,
  entrepriseDocumentInputValidator,
  entrepriseDocumentIdValidator,
  EntrepriseDocumentId,
} from 'camino-common/src/entreprise.js'
import { isSuper, User } from 'camino-common/src/roles.js'
import { canCreateEntreprise, canEditEntreprise, canSeeEntrepriseDocuments } from 'camino-common/src/permissions/entreprises.js'
import { emailCheck } from '../../tools/email-check.js'
import { apiInseeEntrepriseAndEtablissementsGet } from '../../tools/api-insee/index.js'
import { entrepriseFormat } from '../_format/entreprises.js'
import { Pool } from 'pg'
import {
  deleteEntrepriseDocument as deleteEntrepriseDocumentQuery,
  getEntrepriseDocuments as getEntrepriseDocumentsQuery,
  getLargeobjectIdByEntrepriseDocumentId,
  insertEntrepriseDocument,
} from './entreprises.queries.js'
import { newEnterpriseDocumentId } from '../../database/models/_format/id-create.js'
import { isGuyane } from 'camino-common/src/static/pays.js'
import { LargeObjectManager } from 'pg-large-object'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'
import { NewDownload } from './fichiers'
import { TempDocumentName } from 'camino-common/src/document.js'

const conversion = (substanceFiscale: SubstanceFiscale, quantite: IContenuValeur): number => {
  if (typeof quantite !== 'number') {
    return 0
  }

  const unite = openfiscaSubstanceFiscaleUnite(substanceFiscale)

  return quantite / (unite.referenceUniteRatio ?? 1)
}
// VisibleForTesting
export const bodyBuilder = (
  activitesAnnuelles: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  activitesTrimestrielles: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  titres: Pick<Titres, 'titulaires' | 'amodiataires' | 'substances' | 'communes' | 'id'>[],
  annee: number,
  entreprises: Pick<IEntreprise, 'id' | 'categorie' | 'nom'>[]
) => {
  const anneePrecedente = annee - 1
  const body: OpenfiscaRequest = {
    articles: {},
    titres: {},
    communes: {},
  }

  for (const activite of activitesAnnuelles) {
    const titre = titres.find(({ id }) => id === activite.titreId)
    const activiteTrimestresTitre = activitesTrimestrielles.filter(({ titreId }) => titreId === activite.titreId)

    if (!titre) {
      throw new Error(`le titre ${activite.titreId} n’est pas chargé`)
    }

    if (!titre.communes?.length) {
      throw new Error(`les communes du titre ${activite.titreId} ne sont pas chargées`)
    }
    if (!titre.titulaires?.length) {
      throw new Error(`les titulaires du titre ${activite.titreId} ne sont pas chargées`)
    }
    if (!titre.amodiataires) {
      throw new Error(`les amodiataires du titre ${activite.titreId} ne sont pas chargés`)
    }

    // si N titulaires et UN amodiataire le titre appartient fiscalement à l'amodiataire
    // https://trello.com/c/2WJcnFRw/321-featfiscalit%C3%A9-les-titres-avec-un-seul-titulaire-et-un-seul-amodiataire-sont-g%C3%A9r%C3%A9s
    let entrepriseId: null | string = null
    let amodiataire = false
    if (titre.amodiataires.length === 1) {
      entrepriseId = titre.amodiataires[0].id
      amodiataire = true
    } else if (titre.titulaires.length === 1) {
      entrepriseId = titre.titulaires[0].id
    } else {
      throw new Error(`plusieurs entreprises liées au titre ${activite.titreId}, cas non géré`)
    }

    const entreprise = entreprises.find(({ id }) => id === entrepriseId)

    if (!entreprise && !amodiataire) {
      throw new Error(`pas d'entreprise trouvée pour le titre ${activite.titreId}`)
    } else if (!entreprise && amodiataire) {
      console.warn(`le titre ${activite.titreId} appartient à l'entreprise amodiataire et n'est pas dans la liste des entreprises à analyser`)
    } else if (entreprise) {
      const titreGuyannais = titre.communes
        .map(({ id }) => toDepartementId(id))
        .filter(isNotNullNorUndefined)
        .some(departementId => isGuyane(Regions[Departements[departementId].regionId].paysId))

      if (!titre.substances) {
        throw new Error(`les substances du titre ${activite.titreId} ne sont pas chargées`)
      }

      if (titre.substances.length > 0 && activite.contenu) {
        const substanceLegalesWithFiscales = titre.substances.filter(isNotNullNorUndefined).filter(substanceId => substancesFiscalesBySubstanceLegale(substanceId).length)

        if (substanceLegalesWithFiscales.length > 1) {
          // TODO 2022-07-25 on fait quoi ? On calcule quand même ?
          console.error('BOOM, titre avec plusieurs substances légales possédant plusieurs substances fiscales ', titre.id)
        }

        const substancesFiscales = substanceLegalesWithFiscales.flatMap(substanceId => substancesFiscalesBySubstanceLegale(substanceId))

        for (const substancesFiscale of substancesFiscales) {
          const production = conversion(substancesFiscale, activite.contenu.substancesFiscales[substancesFiscale.id])

          if (production > 0) {
            if (!titre.communes) {
              throw new Error(`les communes du titre ${titre.id} ne sont pas chargées`)
            }

            const surfaceTotale = titre.communes.reduce((value, commune) => value + (commune.surface ?? 0), 0)

            let communePrincipale: ICommune | null = null
            const communes: ICommune[] = titre.communes
            for (const commune of communes) {
              if (communePrincipale === null) {
                communePrincipale = commune
              } else if ((communePrincipale?.surface ?? 0) < (commune?.surface ?? 0)) {
                communePrincipale = commune
              }
            }
            if (communePrincipale === null) {
              throw new Error(`Impossible de trouver une commune principale pour le titre ${titre.id}`)
            }
            for (const commune of communes) {
              const articleId = `${titre.id}-${substancesFiscale.id}-${commune.id}`

              body.articles[articleId] = {
                surface_communale: { [anneePrecedente]: commune.surface ?? 0 },
                surface_communale_proportionnee: { [anneePrecedente]: null },
                [substanceFiscaleToInput(substancesFiscale)]: {
                  [anneePrecedente]: production,
                },
                [redevanceCommunale(substancesFiscale)]: {
                  [annee]: null,
                },
                [redevanceDepartementale(substancesFiscale)]: {
                  [annee]: null,
                },
              }

              if (substancesFiscale.id === 'auru' && titreGuyannais) {
                body.articles[articleId].taxe_guyane_brute = { [annee]: null }
                body.articles[articleId].taxe_guyane_deduction = {
                  [annee]: null,
                }
                body.articles[articleId].taxe_guyane = { [annee]: null }
              }

              if (!Object.prototype.hasOwnProperty.call(body.titres, titre.id)) {
                const investissement = activiteTrimestresTitre.reduce((investissement, activite) => {
                  let newInvestissement = 0
                  if (typeof activite?.contenu?.renseignements?.environnement === 'number') {
                    newInvestissement = activite?.contenu?.renseignements?.environnement
                  }

                  return investissement + newInvestissement
                }, 0)
                body.titres[titre.id] = {
                  commune_principale_exploitation: {
                    [anneePrecedente]: communePrincipale.id,
                  },
                  surface_totale: { [anneePrecedente]: surfaceTotale },
                  operateur: {
                    [anneePrecedente]: entreprise.nom ?? '',
                  },
                  investissement: {
                    [anneePrecedente]: investissement.toString(10),
                  },
                  categorie: {
                    [anneePrecedente]: entreprise.categorie === 'PME' ? 'pme' : 'autre',
                  },
                  articles: [articleId],
                }
              } else {
                body.titres[titre.id].articles.push(articleId)
              }

              if (!Object.prototype.hasOwnProperty.call(body.communes, commune.id)) {
                body.communes[commune.id] = { articles: [articleId] }
              } else {
                body.communes[commune.id].articles.push(articleId)
              }
            }
          }
        }
      }
    }
  }

  return body
}

export const toFiscalite = (result: Pick<OpenfiscaResponse, 'articles'>, articleId: string, annee: number): Fiscalite => {
  const article = result.articles[articleId]
  const fiscalite: Fiscalite = {
    redevanceCommunale: 0,
    redevanceDepartementale: 0,
  }
  const communes = Object.keys(article).filter(key => key.startsWith('redevance_communale'))
  const departements = Object.keys(article).filter(key => key.startsWith('redevance_departementale'))
  for (const commune of communes) {
    fiscalite.redevanceCommunale += article[commune]?.[annee] ?? 0
  }
  for (const departement of departements) {
    fiscalite.redevanceDepartementale += article[departement]?.[annee] ?? 0
  }

  if ('taxe_guyane_brute' in article) {
    return {
      ...fiscalite,
      guyane: {
        taxeAurifereBrute: article.taxe_guyane_brute?.[annee] ?? 0,
        taxeAurifere: article.taxe_guyane?.[annee] ?? 0,
        totalInvestissementsDeduits: article.taxe_guyane_deduction?.[annee] ?? 0,
      },
    }
  }

  return fiscalite
}

type Reduced = { guyane: true; fiscalite: FiscaliteGuyane } | { guyane: false; fiscalite: FiscaliteFrance }
// VisibleForTesting
export const responseExtractor = (result: Pick<OpenfiscaResponse, 'articles'>, annee: number): Fiscalite => {
  const redevances: Reduced = Object.keys(result.articles)
    .map(articleId => toFiscalite(result, articleId, annee))
    .reduce<Reduced>(
      (acc, fiscalite) => {
        acc.fiscalite.redevanceCommunale += fiscalite.redevanceCommunale
        acc.fiscalite.redevanceDepartementale += fiscalite.redevanceDepartementale

        if (!acc.guyane && isFiscaliteGuyane(fiscalite)) {
          acc = {
            guyane: true,
            fiscalite: {
              ...acc.fiscalite,
              guyane: {
                taxeAurifereBrute: 0,
                taxeAurifere: 0,
                totalInvestissementsDeduits: 0,
              },
            },
          }
        }
        if (acc.guyane && isFiscaliteGuyane(fiscalite)) {
          acc.fiscalite.guyane.taxeAurifereBrute += fiscalite.guyane.taxeAurifereBrute
          acc.fiscalite.guyane.totalInvestissementsDeduits += fiscalite.guyane.totalInvestissementsDeduits
          acc.fiscalite.guyane.taxeAurifere += fiscalite.guyane.taxeAurifere
        }

        return acc
      },
      {
        guyane: false,
        fiscalite: { redevanceCommunale: 0, redevanceDepartementale: 0 },
      }
    )

  return redevances.fiscalite
}

export const modifierEntreprise = (_pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<void>) => {
  const user = req.auth
  const entreprise = entrepriseModificationValidator.safeParse(req.body)
  if (!user) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!entreprise.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      if (!canEditEntreprise(user, entreprise.data.id)) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
      } else {
        const errors = []

        if (entreprise.data.email && !emailCheck(entreprise.data.email)) {
          errors.push('adresse email invalide')
        }

        const entrepriseOld = await entrepriseGet(entreprise.data.id, { fields: { id: {} } }, user)
        if (!entrepriseOld) {
          errors.push('entreprise inconnue')
        }

        if (entrepriseOld && (entrepriseOld.archive ?? false) !== (entreprise.data.archive ?? false) && !isSuper(user)) {
          errors.push(`interdit d'archiver une entreprise`)
          console.error(`l'utilisateur ${user.id} a essayé de changer le statut d'archivage de l'entreprise ${entreprise.data.id}`)
        }

        if (errors.length) {
          res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
        } else {
          await entrepriseUpsert({
            ...entrepriseOld,
            ...entreprise.data,
          })
          res.sendStatus(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
        }
      }
    } catch (e) {
      console.error(e)
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export const creerEntreprise = (_pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<void>) => {
  const user = req.auth
  const siren = sirenValidator.safeParse(req.body.siren)
  if (!user) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!siren.success) {
    console.warn(`siren '${req.body.siren}' invalide`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    if (!canCreateEntreprise(user)) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    } else {
      try {
        const entrepriseOld = await entrepriseGet(`fr-${siren.data}`, { fields: { id: {} } }, user)

        if (entrepriseOld) {
          console.warn(`l'entreprise ${entrepriseOld.nom} existe déjà dans Camino`)
          res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
        } else {
          const entrepriseInsee = await apiInseeEntrepriseAndEtablissementsGet(siren.data)

          if (!entrepriseInsee) {
            res.sendStatus(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)
          } else {
            await entrepriseUpsert(entrepriseInsee)
            res.sendStatus(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
          }
        }
      } catch (e) {
        console.error(e)
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      }
    }
  }
}
export const getEntreprise = (_pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<EntrepriseType>) => {
  const user = req.auth

  const entrepriseId = req.params.entrepriseId

  if (!entrepriseId) {
    console.warn(`l'entrepriseId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    try {
      // TODO 2023-05-15: utiliser pg-typed
      const entreprise = await entrepriseGet(
        entrepriseId,
        {
          fields: {
            etablissements: { id: {} },
            utilisateurs: { id: {} },
            titulaireTitres: { id: {} },
            amodiataireTitres: { id: {} },
          },
        },
        user
      )

      if (!entreprise) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)
      } else {
        // TODO 2023-05-15: utiliser pg-typed
        // @ts-ignore
        res.json(entrepriseFormat(entreprise))
      }
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export const getEntrepriseDocuments = (pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<EntrepriseDocument[]>) => {
  const user = req.auth

  const entrepriseIdParsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)
  if (!entrepriseIdParsed.success) {
    console.warn(`l'entrepriseId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!canSeeEntrepriseDocuments(user, entrepriseIdParsed.data)) {
    console.warn(`l'utilisateur ${user} n'a pas le droit de voir les documents de l'entreprise ${entrepriseIdParsed.data}`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    const entrepriseDocuments = await getEntrepriseDocumentsQuery([], [entrepriseIdParsed.data], pool, user)
    res.json(entrepriseDocuments)
  }
}

const bufferSize = 16384

export const createLargeObject = async (pool: Pool, tmpFileName: TempDocumentName): Promise<number> => {
  const client = await pool.connect()
  try {
    const man = new LargeObjectManager({ pg: client })

    await client.query('BEGIN')

    const [oid, stream] = await man.createAndWritableStreamAsync(bufferSize)

    const promise = new Promise<number>((resolve, reject) => {
      const pathFrom = join(process.cwd(), `/files/tmp/${tmpFileName}`)
      const fileStream = createReadStream(pathFrom)
      fileStream.on('error', function (e) {
        reject(e)
      })
      fileStream.pipe(stream)
      stream.on('finish', function () {
        client.query('COMMIT')
        resolve(oid)
      })
      stream.on('error', function (e) {
        reject(e)
      })
    })

    return await promise
  } catch (e: any) {
    await client.query('ROLLBACK')
    console.error(e)
    throw new Error('error during largeobject creation')
  } finally {
    client.release()
  }
}

export const postEntrepriseDocument = (pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<EntrepriseDocumentId | Error>) => {
  const user = req.auth

  const entrepriseIdParsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)
  if (!entrepriseIdParsed.success) {
    console.warn(`l'entrepriseId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!canEditEntreprise(user, entrepriseIdParsed.data)) {
    console.warn(`l'utilisateur ${user} n'a pas le droit de voir les documents de l'entreprise ${entrepriseIdParsed.data}`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    const entrepriseDocumentInput = entrepriseDocumentInputValidator.safeParse(req.body)

    if (entrepriseDocumentInput.success) {
      const id = newEnterpriseDocumentId(entrepriseDocumentInput.data.date, entrepriseDocumentInput.data.typeId)
      try {
        const oid = await createLargeObject(pool, entrepriseDocumentInput.data.tempDocumentName)

        await insertEntrepriseDocument(pool, {
          id,
          entreprise_document_type_id: entrepriseDocumentInput.data.typeId,
          description: entrepriseDocumentInput.data.description,
          date: entrepriseDocumentInput.data.date,
          entreprise_id: entrepriseIdParsed.data,
          largeobject_id: oid,
        })
        res.json(id)
      } catch (e: any) {
        console.error(e)
        res.status(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
        res.json(e)
      }
    } else {
      res.status(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
      res.json(entrepriseDocumentInput.error)
    }
  }
}

export const deleteEntrepriseDocument = (pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<void | Error>) => {
  const user = req.auth

  const entrepriseIdParsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)
  const entrepriseDocumentIdParsed = entrepriseDocumentIdValidator.safeParse(req.params.entrepriseDocumentId)
  if (!entrepriseIdParsed.success) {
    console.warn(`l'entrepriseId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!entrepriseDocumentIdParsed.success) {
    console.warn(`le documentId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!canEditEntreprise(user, entrepriseIdParsed.data)) {
    console.warn(`l'utilisateur ${user} n'a pas le droit de supprimer les documents de l'entreprise ${entrepriseIdParsed.data}`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    const entrepriseDocuments = await getEntrepriseDocumentsQuery([], [entrepriseIdParsed.data], pool, user)
    const entrepriseDocument = entrepriseDocuments.find(({ id }) => id === entrepriseDocumentIdParsed.data)

    if (!entrepriseDocument || !entrepriseDocument.can_delete_document) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    } else {
      await deleteEntrepriseDocumentQuery(pool, { id: entrepriseDocument.id, entrepriseId: entrepriseIdParsed.data })
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
    }
  }
}

export const fiscalite = (_pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<Fiscalite>) => {
  const user = req.auth
  if (!user) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    const entrepriseId = req.params.entrepriseId
    const caminoAnnee = req.params.annee

    if (!entrepriseId) {
      console.warn(`l'entrepriseId est obligatoire`)
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    } else if (!caminoAnnee || !isAnnee(caminoAnnee)) {
      console.warn(`l'année ${caminoAnnee} n'est pas correcte`)
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    } else {
      const entreprise = await entrepriseGet(entrepriseId, { fields: { id: {} } }, user)
      if (!entreprise) {
        throw new Error(`l’entreprise ${entrepriseId} est inconnue`)
      }
      const anneeMoins1 = anneePrecedente(caminoAnnee)

      const titres = await titresGet(
        { entreprisesIds: [entrepriseId] },
        {
          fields: {
            titulaires: { id: {} },
            amodiataires: { id: {} },
            substancesEtape: { id: {} },
            pointsEtape: { id: {} },
          },
        },
        user
      )

      // TODO 2022-09-26 feature https://trello.com/c/VnlFB6Z1/294-featfiscalit%C3%A9-masquer-la-section-fiscalit%C3%A9-de-la-fiche-entreprise-pour-les-autres-domaines-que-m
      if (
        !fiscaliteVisible(
          user,
          entrepriseIdValidator.parse(entrepriseId),
          titres.map(({ typeId }) => ({ type_id: typeId }))
        )
      ) {
        console.warn(`la fiscalité n'est pas visible pour l'utilisateur ${user} et l'entreprise ${entrepriseId}`)
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
      } else {
        const activites = await titresActivitesGet(
          // TODO 2022-07-25 Laure, est-ce qu’il faut faire les WRP ?
          {
            typesIds: ['grx', 'gra', 'wrp'],
            // TODO 2022-07-25 Laure, que les déposées ? Pas les « en construction » ?
            statutsIds: ['dep'],
            annees: [anneeMoins1],
            titresIds: titres.map(({ id }) => id),
          },
          { fields: { id: {} } },
          user
        )
        const activitesTrimestrielles = await titresActivitesGet(
          {
            typesIds: ['grp'],
            statutsIds: ['dep'],
            annees: [anneeMoins1],
            titresIds: titres.map(({ id }) => id),
          },
          { fields: { id: {} } },
          user
        )

        const body = bodyBuilder(activites, activitesTrimestrielles, titres, caminoAnneeToNumber(caminoAnnee), [entreprise])
        console.info('body', JSON.stringify(body))
        if (Object.keys(body.articles).length > 0) {
          const result = await apiOpenfiscaCalculate(body)
          console.info('result', JSON.stringify(result))

          const redevances = responseExtractor(result, caminoAnneeToNumber(caminoAnnee))

          res.json(redevances)
        } else {
          res.json({
            redevanceCommunale: 0,
            redevanceDepartementale: 0,
          })
        }
      }
    }
  }
}

export const entrepriseDocumentDownload: NewDownload = async (params, user, pool) => {
  const entrepriseDocumentId = entrepriseDocumentIdValidator.parse(params.documentId)
  const entrepriseDocumentLargeObjectId = await getLargeobjectIdByEntrepriseDocumentId(entrepriseDocumentId, pool, user)

  return { loid: entrepriseDocumentLargeObjectId, fileName: entrepriseDocumentId }
}
