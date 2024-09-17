import { titreArchive, titresGet, titreGet, titreUpsert } from '../../database/queries/titres'
import { HTTP_STATUS } from 'camino-common/src/http'
import { CaminoApiError, ITitre } from '../../types'
import { CommonTitreAdministration, editableTitreValidator, TitreLink, TitreLinks, TitreGet, utilisateurTitreAbonneValidator } from 'camino-common/src/titres'
import { machineFind } from '../../business/rules-demarches/definitions'
import { CaminoRequest, CustomResponse } from './express-type'
import { userSuper } from '../../database/user-super'
import { DeepReadonly, NotNullableKeys, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, isNullOrUndefinedOrEmpty, onlyUnique } from 'camino-common/src/typescript-tools'
import TitresTitres from '../../database/models/titres--titres'
import { titreAdministrationsGet } from '../_format/titres'
import { canDeleteTitre, canEditTitre, canLinkTitres } from 'camino-common/src/permissions/titres'
import { linkTitres, LinkTitresErrors } from '../../database/queries/titres-titres.queries'
import { checkTitreLinks, CheckTitreLinksError } from '../../business/validations/titre-links-validate'
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
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { getTitreUtilisateur } from '../../database/queries/titres-utilisateurs.queries'
import { titreIdValidator, titreIdOrSlugValidator, TitreId } from 'camino-common/src/validators/titres'
import { RestNewGetCall, RestNewPostCall } from '../../server/rest'
import { Effect, Match, pipe } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'
import { DbQueryAccessError } from '../../pg-database'

const etapesAMasquer = [ETAPES_TYPES.classementSansSuite, ETAPES_TYPES.desistementDuDemandeur, ETAPES_TYPES.decisionImplicite, ETAPES_TYPES.demandeDeComplements_RecevabiliteDeLaDemande_]

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
                const machine = machineFind(titre.typeId, demarcheLaPlusRecente.typeId, demarcheLaPlusRecente.etapes, demarcheLaPlusRecente.id)
                if (machine) {
                  try {
                    enAttenteDeAdministration = machine.whoIsBlocking(etapesDerniereDemarche).includes(user.administrationId)
                    const nextEtapes = machine.possibleNextEtapes(etapesDerniereDemarche, getCurrent())
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

const linkTitreError = 'Droit insuffisant pour lier des titres entre eux' as const
const demarcheNonChargeesError = 'Les démarches ne sont pas chargées' as const
type PostTitreLiaisonErrors = DbQueryAccessError | typeof droitInsuffisant | typeof linkTitreError | typeof demarcheNonChargeesError | LinkTitresErrors | CheckTitreLinksError

export const postTitreLiaisons: RestNewPostCall<'/rest/titres/:id/titreLiaisons'> = ({
  pool,
  user,
  params: { id: titreId },
  body: titreFromIds,
}): Effect.Effect<TitreLinks, CaminoApiError<PostTitreLiaisonErrors>> => {
  return Effect.Do.pipe(
    Effect.bind('titre', () =>
      Effect.tryPromise({
        try: async () =>
          titreGet(
            titreId,
            {
              fields: {
                pointsEtape: { id: {} },
                demarches: { id: {} },
              },
            },
            user
          ),
        catch: e => ({ message: "Impossible d'accéder à la base de données" as const, extra: e }),
      })
    ),
    Effect.filterOrFail(
      (binded): binded is NotNullableKeys<typeof binded> => isNotNullNorUndefined(binded.titre),
      () => ({ message: droitInsuffisant })
    ),
    Effect.bind('administrations', ({ titre }) =>
      Effect.tryPromise({
        try: async () => titreAdministrationsGet(titre),
        catch: e => ({ message: "Impossible d'accéder à la base de données" as const, extra: e }),
      })
    ),
    Effect.filterOrFail(
      ({ administrations }) => canLinkTitres(user, administrations),
      () => ({ message: linkTitreError })
    ),
    Effect.filterOrFail(
      ({ titre }) => isNotNullNorUndefined(titre.demarches),
      () => ({ message: demarcheNonChargeesError })
    ),
    Effect.bind('titresFrom', () =>
      Effect.tryPromise({
        try: async () => titresGet({ ids: [...titreFromIds] }, { fields: { id: {} } }, user),
        catch: e => ({ message: "Impossible d'accéder à la base de données" as const, extra: e }),
      })
    ),
    Effect.bind('unused', ({ titre, titresFrom }) => {
      const result = checkTitreLinks(titre.typeId, titreFromIds, titresFrom, titre.demarches ?? [])

      if (result.valid) {
        return Effect.succeed('')
      } else {
        console.warn(result.errors)

        return Effect.fail({ message: result.errors[0], extra: result.errors })
      }
    }),
    Effect.tap(linkTitres(pool, { linkTo: titreId, linkFrom: titreFromIds })),
    Effect.bind('amont', () => titreLinksGet(titreId, 'titreFromId', user)),
    Effect.bind('aval', () => titreLinksGet(titreId, 'titreToId', user)),
    Effect.map(({ amont, aval }) => {
      const result: TitreLinks = { amont, aval }

      return result
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr("Impossible d'accéder à la base de données", demarcheNonChargeesError, () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })),
        Match.whenOr('Droit insuffisant pour accéder au titre ou titre inexistant', linkTitreError, 'droits insuffisants ou titre inexistant', () => ({
          ...caminoError,
          status: HTTP_STATUS.FORBIDDEN,
        })),
        Match.whenOr(
          'ce titre peut avoir un seul titre lié',
          'ce titre ne peut pas être lié à d’autres titres',
          'lien incompatible entre ces types de titre',
          'Problème de validation de données',
          () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })
        ),
        Match.exhaustive
      )
    )
  )
}

const titreLinksGet = (titreId: string, link: 'titreToId' | 'titreFromId', user: DeepReadonly<User>): Effect.Effect<TitreLink[], CaminoError<DbQueryAccessError>> => {
  return pipe(
    Effect.tryPromise({
      try: async () => TitresTitres.query().where(link === 'titreToId' ? 'titreFromId' : 'titreToId', titreId),
      catch: e => ({ message: "Impossible d'accéder à la base de données" as const, extra: e }),
    }),
    Effect.map(titresTitres => titresTitres.map(t => t[link])),
    Effect.flatMap(titreIds =>
      Effect.tryPromise({
        try: async () => {
          if (isNullOrUndefinedOrEmpty(titreIds)) {
            return []
          } else {
            return titresGet({ ids: titreIds }, { fields: { id: {} } }, user)
          }
        },
        catch: e => ({ message: "Impossible d'accéder à la base de données" as const, extra: e }),
      })
    ),
    Effect.map(titres => titres.map(({ id, nom }) => ({ id, nom })))
  )
}

const droitInsuffisant = 'Droit insuffisant pour accéder au titre ou titre inexistant' as const
type GetTitreLiaisonErrors = DbQueryAccessError | typeof droitInsuffisant
export const getTitreLiaisons: RestNewGetCall<'/rest/titres/:id/titreLiaisons'> = ({ user, params }): Effect.Effect<TitreLinks, CaminoApiError<GetTitreLiaisonErrors>> => {
  return Effect.Do.pipe(
    Effect.flatMap(() =>
      Effect.tryPromise({
        try: async () => titreGet(params.id, { fields: { id: {} } }, user),
        catch: e => ({ message: "Impossible d'accéder à la base de données" as const, extra: e }),
      })
    ),
    Effect.filterOrFail(
      titre => isNotNullNorUndefined(titre),
      () => ({ message: droitInsuffisant })
    ),
    Effect.bind('amont', () => titreLinksGet(params.id, 'titreFromId', user)),
    Effect.bind('aval', () => titreLinksGet(params.id, 'titreToId', user)),
    Effect.map(({ amont, aval }) => {
      const value: TitreLinks = { amont, aval }

      return value
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when("Impossible d'accéder à la base de données", () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })),
        Match.when('Droit insuffisant pour accéder au titre ou titre inexistant', () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.exhaustive
      )
    )
  )
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
