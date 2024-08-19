import { Request as JWTRequest } from 'express-jwt'
import { fiscaliteVisible } from 'camino-common/src/fiscalite'
import { Fiscalite, FiscaliteFrance, FiscaliteGuyane } from 'camino-common/src/validators/fiscalite'
import { ICommune, IContenuValeur, IEntreprise } from '../../types'
import { HTTP_STATUS } from 'camino-common/src/http'

import {
  apiOpenfiscaCalculate,
  OpenfiscaRequest,
  OpenfiscaResponse,
  redevanceCommunale,
  redevanceDepartementale,
  substanceFiscaleToInput,
  openfiscaSubstanceFiscaleUnite,
} from '../../tools/api-openfisca/index'
import { titresGet } from '../../database/queries/titres'
import { titresActivitesGet } from '../../database/queries/titres-activites'
import { entrepriseGet, entrepriseUpsert } from '../../database/queries/entreprises'
import TitresActivites from '../../database/models/titres-activites'
import Titres from '../../database/models/titres'
import { CustomResponse } from './express-type'
import { SubstanceFiscale, substancesFiscalesBySubstanceLegale } from 'camino-common/src/static/substancesFiscales'
import { Departements, toDepartementId } from 'camino-common/src/static/departement'
import { DeepReadonly, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { Regions } from 'camino-common/src/static/region'
import { anneePrecedente, caminoAnneeToNumber, isAnnee } from 'camino-common/src/date'
import {
  entrepriseIdValidator,
  entrepriseModificationValidator,
  EntrepriseType,
  sirenValidator,
  EntrepriseDocument,
  entrepriseDocumentInputValidator,
  entrepriseDocumentIdValidator,
  EntrepriseDocumentId,
  newEntrepriseId,
  Entreprise,
  entrepriseValidator,
  entrepriseTypeValidator,
} from 'camino-common/src/entreprise'
import { isSuper, User } from 'camino-common/src/roles'
import { canCreateEntreprise, canEditEntreprise, canSeeEntrepriseDocuments } from 'camino-common/src/permissions/entreprises'
import { emailCheck } from '../../tools/email-check'
import { apiInseeEntrepriseAndEtablissementsGet } from '../../tools/api-insee/index'
import { Pool } from 'pg'
import {
  deleteEntrepriseDocument as deleteEntrepriseDocumentQuery,
  getEntrepriseDocuments as getEntrepriseDocumentsQuery,
  getEntreprises,
  getEntreprise as getEntrepriseQuery,
  getLargeobjectIdByEntrepriseDocumentId,
  insertEntrepriseDocument,
} from './entreprises.queries'
import { newEnterpriseDocumentId } from '../../database/models/_format/id-create'
import { isGuyane } from 'camino-common/src/static/pays'
import { NewDownload } from './fichiers'
import Decimal from 'decimal.js'

import { createLargeObject } from '../../database/largeobjects'
import { z } from 'zod'
import { getEntrepriseEtablissements } from './entreprises-etablissements.queries'

const conversion = (substanceFiscale: SubstanceFiscale, quantite: IContenuValeur): Decimal => {
  if (typeof quantite !== 'number') {
    return new Decimal(0)
  }

  const unite = openfiscaSubstanceFiscaleUnite(substanceFiscale)

  return new Decimal(quantite).div(unite.referenceUniteRatio ?? 1).toDecimalPlaces(3)
}
// VisibleForTesting
export const bodyBuilder = (
  activitesAnnuelles: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  activitesTrimestrielles: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  titres: Pick<Titres, 'titulaireIds' | 'amodiataireIds' | 'substances' | 'communes' | 'id'>[],
  annee: number,
  entreprises: Pick<IEntreprise, 'id' | 'categorie' | 'nom'>[]
): OpenfiscaRequest => {
  const anneePrecedente = annee - 1
  const body: OpenfiscaRequest = {
    articles: {},
    titres: {},
    communes: {},
  }

  for (const activite of activitesAnnuelles) {
    const titre = titres.find(({ id }) => id === activite.titreId)
    const activiteTrimestresTitre = activitesTrimestrielles.filter(({ titreId }) => titreId === activite.titreId)

    if (isNullOrUndefined(titre)) {
      throw new Error(`le titre ${activite.titreId} n’est pas chargé`)
    }

    if (isNullOrUndefined(titre.communes)) {
      throw new Error(`les communes du titre ${activite.titreId} ne sont pas chargées`)
    }
    if (isNullOrUndefined(titre.titulaireIds)) {
      throw new Error(`les titulaires du titre ${activite.titreId} ne sont pas chargées`)
    }
    if (isNullOrUndefined(titre.amodiataireIds)) {
      throw new Error(`les amodiataires du titre ${activite.titreId} ne sont pas chargés`)
    }

    // si N titulaires et UN amodiataire le titre appartient fiscalement à l'amodiataire
    // https://trello.com/c/2WJcnFRw/321-featfiscalit%C3%A9-les-titres-avec-un-seul-titulaire-et-un-seul-amodiataire-sont-g%C3%A9r%C3%A9s
    let entrepriseId: null | string = null
    let amodiataire = false
    if (titre.amodiataireIds.length === 1) {
      entrepriseId = titre.amodiataireIds[0]
      amodiataire = true
    } else if (titre.titulaireIds.length === 1) {
      entrepriseId = titre.titulaireIds[0]
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

          if (production.greaterThan(0)) {
            const surfaceTotale = titre.communes.reduce((value, commune) => value + (commune.surface ?? 0), 0)

            let communePrincipale: ICommune | null = null
            const communes: DeepReadonly<ICommune[]> = titre.communes
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

        if (!acc.guyane && 'guyane' in fiscalite) {
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
        if (acc.guyane && 'guyane' in fiscalite) {
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

export const modifierEntreprise =
  (_pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth
    const entreprise = entrepriseModificationValidator.safeParse(req.body)
    if (!user) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!entreprise.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      try {
        if (!canEditEntreprise(user, entreprise.data.id)) {
          res.sendStatus(HTTP_STATUS.FORBIDDEN)
        } else {
          const errors = []

          if (isNotNullNorUndefined(entreprise.data.email) && !emailCheck(entreprise.data.email)) {
            errors.push('adresse email invalide')
          }

          const entrepriseOld = await entrepriseGet(entreprise.data.id, { fields: { id: {} } }, user)
          if (isNullOrUndefined(entrepriseOld)) {
            errors.push('entreprise inconnue')
          }

          if (entrepriseOld && (entrepriseOld.archive ?? false) !== (entreprise.data.archive ?? false) && !isSuper(user)) {
            errors.push(`interdit d'archiver une entreprise`)
            console.error(`l'utilisateur ${user.id} a essayé de changer le statut d'archivage de l'entreprise ${entreprise.data.id}`)
          }

          if (errors.length) {
            res.sendStatus(HTTP_STATUS.BAD_REQUEST)
          } else {
            await entrepriseUpsert({
              ...entrepriseOld,
              ...entreprise.data,
            })
            res.sendStatus(HTTP_STATUS.NO_CONTENT)
          }
        }
      } catch (e) {
        console.error(e)
        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }
  }

export const creerEntreprise =
  (_pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth
    const siren = sirenValidator.safeParse(req.body.siren)
    if (!user) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!siren.success) {
      console.warn(`siren '${req.body.siren}' invalide`)
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      if (!canCreateEntreprise(user)) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else {
        try {
          const entrepriseOld = await entrepriseGet(newEntrepriseId(`fr-${siren.data}`), { fields: { id: {} } }, user)

          if (entrepriseOld) {
            console.warn(`l'entreprise ${entrepriseOld.nom} existe déjà dans Camino`)
            res.sendStatus(HTTP_STATUS.BAD_REQUEST)
          } else {
            const entrepriseInsee = await apiInseeEntrepriseAndEtablissementsGet(siren.data)

            if (!entrepriseInsee) {
              res.sendStatus(HTTP_STATUS.NOT_FOUND)
            } else {
              await entrepriseUpsert(entrepriseInsee)
              res.sendStatus(HTTP_STATUS.NO_CONTENT)
            }
          }
        } catch (e) {
          console.error(e)
          res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        }
      }
    }
  }
export const getEntreprise =
  (pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<EntrepriseType>): Promise<void> => {
    const parsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)

    if (!parsed.success) {
      console.warn(`l'entrepriseId est obligatoire`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      try {
        const entreprise = await getEntrepriseQuery(pool, parsed.data)
        if (isNullOrUndefined(entreprise)) {
          res.sendStatus(HTTP_STATUS.NOT_FOUND)
        } else {
          const etablissements = await getEntrepriseEtablissements(pool, parsed.data)
          const entrepriseType: EntrepriseType = {
            ...entreprise,
            etablissements: etablissements ?? [],
          }

          res.json(entrepriseTypeValidator.parse(entrepriseType))
        }
      } catch (e) {
        console.error(e)

        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }
  }

export const getEntrepriseDocuments =
  (pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<EntrepriseDocument[]>): Promise<void> => {
    const user = req.auth

    const entrepriseIdParsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)
    if (!entrepriseIdParsed.success) {
      console.warn(`l'entrepriseId est obligatoire`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!canSeeEntrepriseDocuments(user, entrepriseIdParsed.data)) {
      console.warn(`l'utilisateur ${user} n'a pas le droit de voir les documents de l'entreprise ${entrepriseIdParsed.data}`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const entrepriseDocuments = await getEntrepriseDocumentsQuery([], [entrepriseIdParsed.data], pool, user)
      res.json(entrepriseDocuments)
    }
  }

export const postEntrepriseDocument =
  (pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<EntrepriseDocumentId | Error>): Promise<void> => {
    const user = req.auth

    const entrepriseIdParsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)
    if (!entrepriseIdParsed.success) {
      console.warn(`l'entrepriseId est obligatoire`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!canEditEntreprise(user, entrepriseIdParsed.data)) {
      console.warn(`l'utilisateur ${user} n'a pas le droit de voir les documents de l'entreprise ${entrepriseIdParsed.data}`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
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
          res.status(HTTP_STATUS.BAD_REQUEST)
          res.json(e)
        }
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST)
        res.json(entrepriseDocumentInput.error)
      }
    }
  }

export const deleteEntrepriseDocument =
  (pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<void | Error>): Promise<void> => {
    const user = req.auth

    const entrepriseIdParsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)
    const entrepriseDocumentIdParsed = entrepriseDocumentIdValidator.safeParse(req.params.entrepriseDocumentId)
    if (!entrepriseIdParsed.success) {
      console.warn(`l'entrepriseId est obligatoire`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!entrepriseDocumentIdParsed.success) {
      console.warn(`le documentId est obligatoire`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!canEditEntreprise(user, entrepriseIdParsed.data)) {
      console.warn(`l'utilisateur ${user} n'a pas le droit de supprimer les documents de l'entreprise ${entrepriseIdParsed.data}`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const entrepriseDocuments = await getEntrepriseDocumentsQuery([], [entrepriseIdParsed.data], pool, user)
      const entrepriseDocument = entrepriseDocuments.find(({ id }) => id === entrepriseDocumentIdParsed.data)

      if (!entrepriseDocument || !entrepriseDocument.can_delete_document) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else {
        await deleteEntrepriseDocumentQuery(pool, { id: entrepriseDocument.id, entrepriseId: entrepriseIdParsed.data })
        res.sendStatus(HTTP_STATUS.NO_CONTENT)
      }
    }
  }

export const fiscalite =
  (_pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<Fiscalite>): Promise<void> => {
    const user = req.auth
    if (!user) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const caminoAnnee = req.params.annee

      const parsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)

      if (!parsed.success) {
        console.warn(`l'entrepriseId est obligatoire`)
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else if (!caminoAnnee || !isAnnee(caminoAnnee)) {
        console.warn(`l'année ${caminoAnnee} n'est pas correcte`)
        res.sendStatus(HTTP_STATUS.BAD_REQUEST)
      } else {
        const entreprise = await entrepriseGet(parsed.data, { fields: { id: {} } }, user)
        if (!entreprise) {
          throw new Error(`l’entreprise ${parsed.data} est inconnue`)
        }
        const anneeMoins1 = anneePrecedente(caminoAnnee)

        const titres = await titresGet(
          { entreprisesIds: [parsed.data] },
          {
            fields: {
              titulairesEtape: { id: {} },
              amodiatairesEtape: { id: {} },
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
            parsed.data,
            titres.map(({ typeId }) => ({ type_id: typeId }))
          )
        ) {
          console.warn(`la fiscalité n'est pas visible pour l'utilisateur ${user} et l'entreprise ${parsed.data}`)
          res.sendStatus(HTTP_STATUS.FORBIDDEN)
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
          if (Object.keys(body.articles).length > 0) {
            const result = await apiOpenfiscaCalculate(body)

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

export const getAllEntreprises =
  (pool: Pool) =>
  async (_req: JWTRequest<User>, res: CustomResponse<Entreprise[]>): Promise<void> => {
    const allEntreprises = await getEntreprises(pool)
    res.json(z.array(entrepriseValidator).parse(allEntreprises))
  }
