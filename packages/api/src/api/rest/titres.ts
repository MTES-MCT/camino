import { titreArchive, titresGet, titreGet, titreUpdate } from '../../database/queries/titres'
import { HTTP_STATUS } from 'camino-common/src/http'
import { CommonTitreAdministration, editableTitreValidator, TitreLink, TitreLinks, TitreGet, utilisateurTitreAbonneValidator, titreGetValidator, SuperTitre } from 'camino-common/src/titres'
import { CaminoRequest, CustomResponse } from './express-type'
import { userSuper } from '../../database/user-super'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools'
import { CaminoApiError } from '../../types'
import { NotNullableKeys, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import TitresTitres from '../../database/models/titres--titres'
import { titreAdministrationsGet } from '../_format/titres'
import { canDeleteTitre, canEditTitre, canLinkTitres } from 'camino-common/src/permissions/titres'
import { linkTitres } from '../../database/queries/titres-titres.queries'
import { checkTitreLinks, CheckTitreLinksError } from '../../business/validations/titre-links-validate'
import { titreEtapeForMachineValidator, toMachineEtapes } from '../../business/rules-demarches/machine-common'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { CaminoDate, getCurrent } from 'camino-common/src/date'
import { isAdministration, isSuper, User, UserNotNull } from 'camino-common/src/roles'
import { canEditDemarche, canCreateTravaux } from 'camino-common/src/permissions/titres-demarches'
import { utilisateurTitreCreate, utilisateurTitreDelete } from '../../database/queries/utilisateurs-titres'
import { titreUpdateTask } from '../../business/titre-update'
import { getDoublonsByTitreId, getTitre as getTitreDb } from './titres.queries'
import type { Pool } from 'pg'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { accesSuperSeulementError, getTitresWithBrouillons, GetTitresWithBrouillonsErrors, getTitreUtilisateur } from '../../database/queries/titres-utilisateurs.queries'
import { titreIdValidator, titreIdOrSlugValidator, TitreId } from 'camino-common/src/validators/titres'
import { RestNewGetCall, RestNewPostCall } from '../../server/rest'
import { Effect, Match, pipe } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'
import { EffectDbQueryAndValidateErrors } from '../../pg-database'
import { CaminoMachines, machineFind } from '../../business/rules-demarches/machines'
import { demarcheEnregistrementDemandeDateFind } from 'camino-common/src/demarche'

const etapesAMasquer = [ETAPES_TYPES.classementSansSuite, ETAPES_TYPES.desistementDuDemandeur, ETAPES_TYPES.demandeDeComplements_RecevabiliteDeLaDemande_]

type TitresSuperErrors = GetTitresWithBrouillonsErrors
export const titresSuper: RestNewGetCall<'/rest/titresSuper'> = (rootPipe): Effect.Effect<SuperTitre[], CaminoApiError<TitresSuperErrors>> =>
  rootPipe.pipe(
    Effect.filterOrFail(
      ({ user }) => isSuper(user),
      () => ({ message: accesSuperSeulementError })
    ),
    Effect.flatMap(({ pool, user }) => getTitresWithBrouillons(pool, user)),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", 'Les données en base ne correspondent pas à ce qui est attendu', () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
        Match.whenOr('Seuls les super peuvent accéder à ces données', () => ({
          ...caminoError,
          status: HTTP_STATUS.FORBIDDEN,
        })),
        Match.exhaustive
      )
    )
  )

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

        const titresFormated: CommonTitreAdministration[] = []
        for (const titre of titres) {
          if (titre.slug !== undefined) {
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
            if (isNotNullNorUndefined(demarcheLaPlusRecente)) {
              if (isNullOrUndefinedOrEmpty(demarcheLaPlusRecente.etapes)) {
                throw new Error('les étapes ne sont pas chargées')
              }
              if (demarcheLaPlusRecente.statutId !== DemarchesStatutsIds.EnConstruction) {
                const etapes = demarcheLaPlusRecente.etapes.map(etape => titreEtapeForMachineValidator.parse(etape))
                const etapesDerniereDemarche = toMachineEtapes(etapes)
                const firstEtapeDate = demarcheEnregistrementDemandeDateFind(demarcheLaPlusRecente.etapes)
                let machine: CaminoMachines | undefined
                // TODO 2024-12-02 à virer quand on enlève deepreadonly et qu'on type mieux demarcheEnregistrementDemandeDateFind
                if (isNotNullNorUndefined(firstEtapeDate)) {
                  machine = machineFind(titre.typeId, demarcheLaPlusRecente.typeId, demarcheLaPlusRecente.id, firstEtapeDate)
                }
                derniereEtape = etapesDerniereDemarche[etapesDerniereDemarche.length - 1]
                if (isNotNullNorUndefined(machine)) {
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
                titresFormated.push({
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
                })
              }
            } else {
              titresFormated.push({
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
              })
            }
          }
        }

        res.json(titresFormated)
      } else {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      }
    }
  }

const linkTitreError = 'Droit insuffisant pour lier des titres entre eux' as const
const demarcheNonChargeesError = 'Les démarches ne sont pas chargées' as const
type PostTitreLiaisonErrors = EffectDbQueryAndValidateErrors | typeof droitInsuffisant | typeof linkTitreError | typeof demarcheNonChargeesError | CheckTitreLinksError

export const postTitreLiaisons: RestNewPostCall<'/rest/titres/:id/titreLiaisons'> = (rootPipe): Effect.Effect<TitreLinks, CaminoApiError<PostTitreLiaisonErrors>> => {
  return rootPipe.pipe(
    Effect.bind('titre', ({ user, params }) =>
      Effect.tryPromise({
        try: async () =>
          titreGet(
            params.id,
            {
              fields: {
                pointsEtape: { id: {} },
                demarches: { id: {} },
              },
            },
            user
          ),
        catch: e => ({ message: "Impossible d'exécuter la requête dans la base de données" as const, extra: e }),
      })
    ),
    Effect.filterOrFail(
      (binded): binded is NotNullableKeys<typeof binded> => isNotNullNorUndefined(binded.titre),
      () => ({ message: droitInsuffisant })
    ),
    Effect.bind('administrations', ({ titre }) =>
      Effect.tryPromise({
        try: async () => titreAdministrationsGet(titre),
        catch: e => ({ message: "Impossible d'exécuter la requête dans la base de données" as const, extra: e }),
      })
    ),
    Effect.filterOrFail(
      ({ administrations, user }) => canLinkTitres(user, administrations),
      () => ({ message: linkTitreError })
    ),
    Effect.filterOrFail(
      ({ titre }) => isNotNullNorUndefined(titre.demarches),
      () => ({ message: demarcheNonChargeesError })
    ),
    Effect.bind('titresFrom', ({ body, user }) =>
      Effect.tryPromise({
        try: async () => titresGet({ ids: [...body] }, { fields: { id: {} } }, user),
        catch: e => ({ message: "Impossible d'exécuter la requête dans la base de données" as const, extra: e }),
      })
    ),
    Effect.tap(({ titre, titresFrom, body }) => {
      const result = checkTitreLinks(titre.typeId, body, titresFrom, titre.demarches ?? [])

      if (result.valid) {
        return Effect.succeed(null)
      } else {
        console.warn(result.errors)

        return Effect.fail({ message: result.errors[0], extra: result.errors })
      }
    }),
    Effect.tap(({ pool, params, body }) => linkTitres(pool, { linkTo: params.id, linkFrom: body })),
    Effect.bind('amont', ({ params, user }) => titreLinksGet(params.id, 'titreFromId', user)),
    Effect.bind('aval', ({ params, user }) => titreLinksGet(params.id, 'titreToId', user)),
    Effect.map(({ amont, aval }) => {
      const result: TitreLinks = { amont, aval }

      return result
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", demarcheNonChargeesError, 'Les données en base ne correspondent pas à ce qui est attendu', () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
        Match.whenOr('Droit insuffisant pour accéder au titre ou titre inexistant', linkTitreError, 'droits insuffisants ou titre inexistant', () => ({
          ...caminoError,
          status: HTTP_STATUS.FORBIDDEN,
        })),
        Match.whenOr('ce titre peut avoir un seul titre lié', 'ce titre ne peut pas être lié à d’autres titres', 'lien incompatible entre ces types de titre', () => ({
          ...caminoError,
          status: HTTP_STATUS.BAD_REQUEST,
        })),
        Match.exhaustive
      )
    )
  )
}

const titreLinksGet = (titreId: string, link: 'titreToId' | 'titreFromId', user: User): Effect.Effect<TitreLink[], CaminoError<EffectDbQueryAndValidateErrors>> => {
  return pipe(
    Effect.tryPromise({
      try: async () => TitresTitres.query().where(link === 'titreToId' ? 'titreFromId' : 'titreToId', titreId),
      catch: e => ({ message: "Impossible d'exécuter la requête dans la base de données" as const, extra: e }),
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
        catch: e => ({ message: "Impossible d'exécuter la requête dans la base de données" as const, extra: e }),
      })
    ),
    Effect.map(titres => titres.map(({ id, nom }) => ({ id, nom })))
  )
}

const droitInsuffisant = 'Droit insuffisant pour accéder au titre ou titre inexistant' as const
type GetTitreLiaisonErrors = EffectDbQueryAndValidateErrors | typeof droitInsuffisant
export const getTitreLiaisons: RestNewGetCall<'/rest/titres/:id/titreLiaisons'> = (rootPipe): Effect.Effect<TitreLinks, CaminoApiError<GetTitreLiaisonErrors>> => {
  return rootPipe.pipe(
    Effect.bind('titre', ({ params, user }) =>
      Effect.tryPromise({
        try: async () => titreGet(params.id, { fields: { id: {} } }, user),
        catch: e => ({ message: "Impossible d'exécuter la requête dans la base de données" as const, extra: e }),
      })
    ),
    Effect.filterOrFail(
      titre => isNotNullNorUndefined(titre),
      () => ({ message: droitInsuffisant })
    ),
    Effect.bind('amont', ({ params, user }) => titreLinksGet(params.id, 'titreFromId', user)),
    Effect.bind('aval', ({ params, user }) => titreLinksGet(params.id, 'titreToId', user)),
    Effect.map(({ amont, aval }) => {
      const value: TitreLinks = { amont, aval }

      return value
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", 'Les données en base ne correspondent pas à ce qui est attendu', () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
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
          for (const id of doublonIds) {
            await titreUpdateTask(pool, id)
          }
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

type GetUtilisateurTitreAbonnerError = EffectDbQueryAndValidateErrors | typeof droitInsuffisant
export const getUtilisateurTitreAbonner: RestNewGetCall<'/rest/titres/:titreId/abonne'> = (rootPipe): Effect.Effect<boolean, CaminoApiError<GetUtilisateurTitreAbonnerError>> =>
  rootPipe.pipe(
    Effect.filterOrFail(
      (value): value is typeof value & { user: UserNotNull } => isNotNullNorUndefined(value.user),
      () => ({ message: droitInsuffisant })
    ),
    Effect.flatMap(({ user, pool, params }) => getTitreUtilisateur(pool, params.titreId, user.id)),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", 'Les données en base ne correspondent pas à ce qui est attendu', () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
        Match.when('Droit insuffisant pour accéder au titre ou titre inexistant', () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.exhaustive
      )
    )
  )

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
          if (isNullOrUndefined(titreOld.administrationsLocales)) {
            throw new Error("pas d'administrations locales chargées")
          }

          if (!canEditTitre(user, titreOld.typeId, titreOld.titreStatutId, titreOld.administrationsLocales ?? [])) {
            res.sendStatus(HTTP_STATUS.FORBIDDEN)
          } else {
            await titreUpdate(titreId, parsedBody.data)

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
          const titreStripped = titreGetValidator.parse(titre)
          res.json(titreStripped)
        }
      } catch (e) {
        console.error(e)

        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }
  }
