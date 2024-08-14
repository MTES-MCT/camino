import { titreArchive, titresGet, titreGet, titreUpsert } from '../../database/queries/titres'
import { HTTP_STATUS } from 'camino-common/src/http'
import { ITitre } from '../../types'
import { CommonTitreAdministration, editableTitreValidator, TitreLink, TitreLinks, TitreGet, titreLinksValidator, utilisateurTitreAbonneValidator } from 'camino-common/src/titres'
import { demarcheDefinitionFind } from '../../business/rules-demarches/definitions'
import { CaminoRequest, CustomResponse } from './express-type'
import { userSuper } from '../../database/user-super'
import { NotNullableKeys, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools'
import TitresTitres from '../../database/models/titres--titres'
import { titreAdministrationsGet } from '../_format/titres'
import { canDeleteTitre, canEditTitre, canLinkTitres } from 'camino-common/src/permissions/titres'
import { linkTitres } from '../../database/queries/titres-titres.queries'
import { checkTitreLinks } from '../../business/validations/titre-links-validate'
import { titreEtapeForMachineValidator, toMachineEtapes } from '../../business/rules-demarches/machine-common'
import { TitreReference } from 'camino-common/src/titres-references'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { CaminoDate, getCurrent } from 'camino-common/src/date'
import { isAdministration, User } from 'camino-common/src/roles'
import { canEditDemarche, canCreateTravaux } from 'camino-common/src/permissions/titres-demarches'
import { utilisateurTitreCreate, utilisateurTitreDelete } from '../../database/queries/utilisateurs-titres'
import { titreUpdateTask } from '../../business/titre-update'
import { getDoublonsByTitreId, getTitre as getTitreDb } from './titres.queries'
import type { Pool } from 'pg'
import { z } from 'zod'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { getTitreUtilisateur } from '../../database/queries/titres-utilisateurs.queries'
import { titreIdValidator, titreIdOrSlugValidator, TitreId } from 'camino-common/src/validators/titres'
import { callAndExit } from '../../tools/fp-tools'

const etapesAMasquer = [
  ETAPES_TYPES.classementSansSuite,
  ETAPES_TYPES.desistementDuDemandeur,
  ETAPES_TYPES.noteInterneSignalee,
  ETAPES_TYPES.decisionImplicite,
  ETAPES_TYPES.demandeDeComplements_RecevabiliteDeLaDemande_,
]

type AdministrationTitreSanitize = NotNullableKeys<Required<Pick<ITitre, 'slug' | 'titulaireIds' | 'titreStatutId'>>> &
  Pick<ITitre, 'typeId' | 'id' | 'nom' | 'activitesEnConstruction' | 'activitesAbsentes'>

type TitreAdministrationAvecReferences = {
  titre: AdministrationTitreSanitize
  references: TitreReference[]
} & Pick<CommonTitreAdministration, 'prochainesEtapes' | 'derniereEtape' | 'enAttenteDeAdministration'>

export const titresAdministrations =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<CommonTitreAdministration[]>): Promise<void> => {
    const user = req.auth

    if (!user) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      if (isAdministration(user)) {
        const filters = {
          statutsIds: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire],
        }

        const titresAutorises = await titresGet(
          filters,
          {
            fields: { pointsEtape: { id: {} }, demarches: { id: {} } },
          },
          user
        )
        const titresAutorisesIds = titresAutorises
          .filter(titre => {
            if (!titre.titreStatutId) {
              throw new Error('le statut du titre est obligatoire')
            }

            if (titre.administrationsLocales === undefined) {
              throw new Error('les administrations locales doivent être chargées')
            }

            if (titre.demarches === undefined) {
              throw new Error('les démarches doivent être chargées')
            }

            return (
              canEditTitre(user, titre.typeId, titre.titreStatutId, titre.administrationsLocales ?? []) ||
              canEditDemarche(user, titre.typeId, titre.titreStatutId, titre.administrationsLocales ?? []) ||
              canCreateTravaux(
                user,
                titre.typeId,
                titre.administrationsLocales ?? [],
                titre.demarches.map(({ demarcheDateDebut }) => ({ demarche_date_debut: demarcheDateDebut ?? null }))
              )
            )
          })
          .map(({ id }) => id)
        const titres = await titresGet(
          { ...filters, ids: titresAutorisesIds, colonne: 'nom' },
          {
            fields: {
              titulairesEtape: { id: {} },
              activites: { id: {} },
              demarches: { etapes: { id: {} } },
            },
          },
          userSuper
        )

        const titresFormated: CommonTitreAdministration[] = titres
          .map((titre: ITitre): TitreAdministrationAvecReferences | null => {
            if (titre.slug === undefined) {
              return null
            }

            if (!titre.titulaireIds) {
              throw new Error('les titulaires ne sont pas chargés')
            }

            if (!titre.references) {
              throw new Error('les références ne sont pas chargées')
            }

            if (!titre.activites) {
              throw new Error('les activités ne sont pas chargées')
            }

            const references = titre.references

            if (!titre.demarches) {
              throw new Error('les démarches ne sont pas chargées')
            }

            const demarcheLaPlusRecente =
              titre.demarches.length > 0 ? titre.demarches.toSorted(({ ordre: ordreA }, { ordre: ordreB }) => (ordreA ?? 0) - (ordreB ?? 0))[titre.demarches.length - 1] : null
            let enAttenteDeAdministration = false
            const prochainesEtapes: EtapeTypeId[] = []
            let derniereEtape: {
              etapeTypeId: EtapeTypeId
              date: CaminoDate
            } | null = null
            if (demarcheLaPlusRecente !== null) {
              if (!demarcheLaPlusRecente.etapes) {
                throw new Error('les étapes ne sont pas chargées')
              }
              if (demarcheLaPlusRecente.statutId === DemarchesStatutsIds.EnConstruction) {
                return null
              } else {
                const etapes = demarcheLaPlusRecente.etapes.map(etape => titreEtapeForMachineValidator.parse(etape))
                const etapesDerniereDemarche = toMachineEtapes(etapes)
                derniereEtape = etapesDerniereDemarche[etapesDerniereDemarche.length - 1]
                const dd = demarcheDefinitionFind(titre.typeId, demarcheLaPlusRecente.typeId, demarcheLaPlusRecente.etapes, demarcheLaPlusRecente.id)
                if (dd) {
                  try {
                    enAttenteDeAdministration = dd.machine.whoIsBlocking(etapesDerniereDemarche).includes(user.administrationId)
                    const nextEtapes = dd.machine.possibleNextEtapes(etapesDerniereDemarche, getCurrent())
                    prochainesEtapes.push(
                      ...nextEtapes
                        .map(etape => etape.etapeTypeId)
                        .filter(onlyUnique)
                        .filter(etape => !etapesAMasquer.includes(etape))
                    )
                  } catch (e) {
                    console.error(`Impossible de traiter le titre ${titre.id} car la démarche ${demarcheLaPlusRecente.typeId} n'est pas valide`, e)
                  }
                }
              }
            }

            return {
              titre: titre as AdministrationTitreSanitize,
              references,
              enAttenteDeAdministration,
              derniereEtape,
              prochainesEtapes,
            }
          })
          .filter((titre: TitreAdministrationAvecReferences | null): titre is TitreAdministrationAvecReferences => titre !== null)
          .map(({ titre, references, enAttenteDeAdministration, derniereEtape, prochainesEtapes }) => {
            return {
              id: titre.id,
              slug: titre.slug,
              nom: titre.nom,
              titre_statut_id: titre.titreStatutId,
              type_id: titre.typeId,
              references,
              titulaireIds: titre.titulaireIds,
              enAttenteDeAdministration,
              derniereEtape,
              prochainesEtapes,
            }
          })

        res.json(titresFormated)
      } else {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      }
    }
  }

export const postTitreLiaisons =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<TitreLinks>): Promise<void> => {
    const user = req.auth

    const titreId = titreIdValidator.safeParse(req.params.id)
    const titreFromIds = z.array(titreIdValidator).safeParse(req.body)

    if (!titreFromIds.success || titreFromIds.data.length === 0) {
      throw new Error(`un tableau est attendu en corps de message : '${titreFromIds}'`)
    }

    if (!titreId.success) {
      throw new Error('le paramètre id est obligatoire')
    }

    const titre = await titreGet(
      titreId.data,
      {
        fields: {
          pointsEtape: { id: {} },
          demarches: { id: {} },
        },
      },
      user
    )

    if (!titre) throw new Error("le titre n'existe pas")

    const administrations = titreAdministrationsGet(titre)
    if (!canLinkTitres(user, administrations)) throw new Error('droits insuffisants')

    if (!titre.demarches) {
      throw new Error('les démarches ne sont pas chargées')
    }

    const titresFrom = await titresGet({ ids: titreFromIds.data }, { fields: { id: {} } }, user)

    const check = checkTitreLinks(titre.typeId, titreFromIds.data, titresFrom, titre.demarches)
    if (!check.valid) {
      throw new Error(check.errors.join('. '))
    }

    await callAndExit(linkTitres(pool, { linkTo: titreId.data, linkFrom: titreFromIds.data }), async () => {})

    res.json({
      amont: await titreLinksGet(titreId.data, 'titreFromId', user),
      aval: await titreLinksGet(titreId.data, 'titreToId', user),
    })
  }
export const getTitreLiaisons =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<TitreLinks>): Promise<void> => {
    const user = req.auth

    const titreId = req.params.id

    if (!titreId) {
      res.json({ amont: [], aval: [] })
    } else {
      const titre = await titreGet(titreId, { fields: { id: {} } }, user)
      if (!titre) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else {
        const value: TitreLinks = {
          amont: await titreLinksGet(titreId, 'titreFromId', user),
          aval: await titreLinksGet(titreId, 'titreToId', user),
        }
        res.json(titreLinksValidator.parse(value))
      }
    }
  }

const titreLinksGet = async (titreId: string, link: 'titreToId' | 'titreFromId', user: User): Promise<TitreLink[]> => {
  const titresTitres = await TitresTitres.query().where(link === 'titreToId' ? 'titreFromId' : 'titreToId', titreId)
  const titreIds = titresTitres.map(r => r[link])

  if (titreIds.length > 0) {
    const titres = await titresGet({ ids: titreIds }, { fields: { id: {} } }, user)

    return titres.map(({ id, nom }) => ({ id, nom }))
  } else {
    return []
  }
}

export const removeTitre =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth

    const titreId = titreIdValidator.safeParse(req.params.titreId)
    if (!titreId.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      const titreOld = await titreGet(
        titreId.data,
        {
          fields: {
            demarches: { etapes: { id: {} } },
            activites: { id: {} },
          },
        },
        user
      )

      if (!titreOld) {
        res.sendStatus(HTTP_STATUS.NOT_FOUND)
      } else if (!canDeleteTitre(user)) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else {
        await titreArchive(titreId.data)
        await titreUpdateTask(pool, titreId.data)
        if (isNotNullNorUndefined(titreOld.doublonTitreId)) {
          await titreUpdateTask(pool, titreOld.doublonTitreId)
        }

        const doublonIds: TitreId[] = await getDoublonsByTitreId(pool, titreId.data)
        if (isNotNullNorUndefinedNorEmpty(doublonIds)) {
          doublonIds.forEach(async id => titreUpdateTask(pool, id))
        }
        res.sendStatus(HTTP_STATUS.NO_CONTENT)
      }
    }
  }

export const utilisateurTitreAbonner =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth
    const parsedBody = utilisateurTitreAbonneValidator.safeParse(req.body)
    const titreId: TitreId | undefined | null = titreIdValidator.nullable().optional().parse(req.params.titreId)
    if (isNullOrUndefined(titreId)) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else if (!parsedBody.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      try {
        if (!user) {
          res.sendStatus(HTTP_STATUS.BAD_REQUEST)
        } else {
          const titre = await titreGet(titreId, { fields: { id: {} } }, user)

          if (!titre) {
            res.sendStatus(HTTP_STATUS.FORBIDDEN)
          } else {
            if (parsedBody.data.abonne) {
              await utilisateurTitreCreate({ utilisateurId: user.id, titreId })
            } else {
              await utilisateurTitreDelete(user.id, titreId)
            }
          }
          res.sendStatus(HTTP_STATUS.NO_CONTENT)
        }
      } catch (e) {
        console.error(e)

        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }
  }

export const getUtilisateurTitreAbonner =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<boolean>): Promise<void> => {
    const user = req.auth
    const parsedTitreId = titreIdValidator.safeParse(req.params.titreId)
    if (!parsedTitreId.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      try {
        if (!user) {
          res.sendStatus(HTTP_STATUS.BAD_REQUEST)
        } else {
          res.send(await getTitreUtilisateur(pool, parsedTitreId.data, user.id))
        }
      } catch (e) {
        console.error(e)

        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }
  }

export const updateTitre =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const titreId: TitreId | undefined | null = titreIdValidator.optional().nullable().parse(req.params.titreId)
    const user = req.auth
    const parsedBody = editableTitreValidator.safeParse(req.body)
    if (!titreId) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else if (!parsedBody.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else if (titreId !== parsedBody.data.id) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      try {
        const titreOld = await titreGet(titreId, { fields: { pointsEtape: { id: {} } } }, user)

        if (isNullOrUndefined(titreOld)) {
          res.sendStatus(HTTP_STATUS.NOT_FOUND)
        } else {
          if (isNullOrUndefined(titreOld?.administrationsLocales)) {
            throw new Error("pas d'administrations locales chargées")
          }

          if (!canEditTitre(user, titreOld.typeId, titreOld.titreStatutId, titreOld.administrationsLocales ?? [])) {
            res.sendStatus(HTTP_STATUS.FORBIDDEN)
          } else {
            // on doit utiliser upsert (plutôt qu'un simple update)
            // car le titre contient des références (tableau d'objet)
            await titreUpsert(parsedBody.data)

            await titreUpdateTask(pool, titreId)
            res.sendStatus(HTTP_STATUS.NO_CONTENT)
          }
        }
      } catch (e) {
        console.error(e)

        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }
  }

export const getTitre =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<TitreGet>): Promise<void> => {
    const titreId: string | undefined = req.params.titreId
    const user = req.auth
    if (!titreId) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      try {
        const titre = await getTitreDb(pool, user, titreIdOrSlugValidator.parse(titreId))

        if (titre === null) {
          res.sendStatus(HTTP_STATUS.NOT_FOUND)
        } else {
          res.json(titre)
        }
      } catch (e) {
        console.error(e)

        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }
  }
