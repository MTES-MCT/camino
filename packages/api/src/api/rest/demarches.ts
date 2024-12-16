import { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { CaminoRequest, CustomResponse } from './express-type'
import { DemarcheCreationOutput, demarcheIdOrSlugValidator, GetDemarcheMiseEnConcurrence, GetResultatMiseEnConcurrence } from 'camino-common/src/demarche'
import {
  getDemarcheByIdOrSlug as getDemarcheByIdOrSlugDb,
  GetDemarcheByIdOrSlugErrors,
  getDemarchePivotEnConcurrence,
  getDemarchesEnConcurrenceQuery,
  getEtapesByDemarcheId,
} from './demarches.queries'
import { GetDemarcheByIdOrSlug, getDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { getAdministrationsLocalesByTitreId, getDemarchesByTitreId, getTitreByIdOrSlug, getTitulairesAmodiatairesByTitreId } from './titres.queries'
import { isNullOrUndefined, memoize } from 'camino-common/src/typescript-tools'
import { canReadDemarche } from './permissions/demarches'
import { titreDemarcheArchive, titreDemarcheCreate, titreDemarcheGet } from '../../database/queries/titres-demarches'
import { titreDemarcheUpdateTask } from '../../business/titre-demarche-update'
import { canCreateDemarche, canCreateTravaux, canDeleteDemarche, canPublishResultatMiseEnConcurrence } from 'camino-common/src/permissions/titres-demarches'
import { userSuper } from '../../database/user-super'
import { RestNewGetCall, RestNewPostCall } from '../../server/rest'
import { Effect, Match } from 'effect'
import { isDemarcheTypeId, isTravaux } from 'camino-common/src/static/demarchesTypes'
import { titreGet } from '../../database/queries/titres'
import { CaminoApiError } from '../../types'
import { EffectDbQueryAndValidateErrors } from '../../pg-database'
import { callAndExit } from '../../tools/fp-tools'

export const getDemarcheByIdOrSlug =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<GetDemarcheByIdOrSlug>): Promise<void> => {
    try {
      const demarcheIdOrSlugParsed = demarcheIdOrSlugValidator.safeParse(req.params.demarcheIdOrSlug)
      const user = req.auth
      if (!demarcheIdOrSlugParsed.success) {
        res.sendStatus(HTTP_STATUS.BAD_REQUEST)
      } else {
        const demarche = await callAndExit(getDemarcheByIdOrSlugDb(pool, demarcheIdOrSlugParsed.data))
        const titre = await getTitreByIdOrSlug(pool, demarche.titre_id)

        const administrationsLocales = memoize(() => getAdministrationsLocalesByTitreId(pool, demarche.titre_id))

        if (
          await canReadDemarche(
            { ...demarche, titre_public_lecture: titre.public_lecture },
            user,
            memoize(() => Promise.resolve(titre.titre_type_id)),
            administrationsLocales,
            memoize(() => getTitulairesAmodiatairesByTitreId(pool, demarche.titre_id))
          )
        ) {
          res.json(getDemarcheByIdOrSlugValidator.parse(demarche))
        } else {
          res.sendStatus(HTTP_STATUS.FORBIDDEN)
        }
      }
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }

export const demarcheSupprimer =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    try {
      const demarcheIdOrSlugParsed = demarcheIdOrSlugValidator.safeParse(req.params.demarcheIdOrSlug)
      if (!demarcheIdOrSlugParsed.success) {
        res.status(HTTP_STATUS.BAD_REQUEST)

        return
      }

      const user = req.auth
      const idOrSlug = demarcheIdOrSlugParsed.data
      const demarcheOld = await titreDemarcheGet(idOrSlug, { fields: { titre: { pointsEtape: { id: {} } }, etapes: { id: {} } } }, userSuper)
      if (isNullOrUndefined(demarcheOld)) {
        res.sendStatus(HTTP_STATUS.BAD_REQUEST)

        return
      }

      const etapes = demarcheOld.etapes
      if (isNullOrUndefined(etapes)) throw new Error('les étapes ne sont pas chargées')
      if (isNullOrUndefined(demarcheOld.titre)) throw new Error("le titre n'existe pas")
      if (isNullOrUndefined(demarcheOld.titre.administrationsLocales)) throw new Error('les administrations locales ne sont pas chargées')

      if (!canDeleteDemarche(user, demarcheOld.titre.typeId, demarcheOld.titre.titreStatutId, demarcheOld.titre.administrationsLocales, { etapes })) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)

        return
      }

      await titreDemarcheArchive(demarcheOld.id)

      await titreDemarcheUpdateTask(pool, null, demarcheOld.titreId)
      res.sendStatus(HTTP_STATUS.NO_CONTENT)
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }

export const demarcheCreer: RestNewPostCall<'/rest/demarches'> = (rootPipe): Effect.Effect<DemarcheCreationOutput, CaminoApiError<string>> => {
  return rootPipe.pipe(
    Effect.flatMap(({ user, body: demarche, pool }) =>
      Effect.tryPromise({
        try: async () => {
          const titre = await titreGet(demarche.titreId, { fields: { pointsEtape: { id: {} } } }, user)

          if (!titre) throw new Error("le titre n'existe pas")

          if (!isDemarcheTypeId(demarche.typeId)) {
            throw new Error('droits insuffisants')
          }
          if (titre.administrationsLocales === undefined) {
            throw new Error('les administrations locales doivent être chargées')
          }

          const demarches = await callAndExit(getDemarchesByTitreId(pool, demarche.titreId))

          if (isTravaux(demarche.typeId) && !canCreateTravaux(user, titre.typeId, titre.administrationsLocales ?? [], demarches)) {
            throw new Error('droits insuffisants')
          }
          if (!isTravaux(demarche.typeId) && !canCreateDemarche(user, titre.typeId, titre.titreStatutId, titre.administrationsLocales ?? [], demarches)) {
            throw new Error('droits insuffisants')
          }

          const demarcheCreated = await titreDemarcheCreate(demarche)

          await titreDemarcheUpdateTask(pool, demarcheCreated.id, demarcheCreated.titreId)

          const demarcheUpdate = await titreDemarcheGet(demarcheCreated.id, { fields: { id: {} } }, user)

          if (isNullOrUndefined(demarcheUpdate?.slug)) {
            throw new Error("Problème lors de l'enregistrement de la démarche")
          }

          return { slug: demarcheUpdate.slug }
        },
        catch: unknown => {
          // TODO 2024-08-08 il faut utiliser effect au dessus pour pouvoir mettre le bon code http
          if (unknown instanceof Error) {
            return { message: unknown.message, status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
          }

          return { message: "Problème lors de l'enregistrement de la démarche" as const, extra: unknown, status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        },
      })
    )
  )
}

export const getDemarchesEnConcurrence: RestNewGetCall<'/rest/demarches/:demarcheId/miseEnConcurrence'> = (
  rootPipe
): Effect.Effect<GetDemarcheMiseEnConcurrence[], CaminoApiError<EffectDbQueryAndValidateErrors>> => {
  return rootPipe.pipe(
    Effect.flatMap(({ pool, params, user }) => getDemarchesEnConcurrenceQuery(pool, params.demarcheId, user)),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", 'Les données en base ne correspondent pas à ce qui est attendu', () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
        Match.exhaustive
      )
    )
  )
}

export const getResultatEnConcurrence: RestNewGetCall<'/rest/demarches/:demarcheId/resultatMiseEnConcurrence'> = (
  rootPipe
): Effect.Effect<GetResultatMiseEnConcurrence, CaminoApiError<EffectDbQueryAndValidateErrors | GetDemarcheByIdOrSlugErrors | 'droits insuffisants'>> => {
  return rootPipe.pipe(
    Effect.bind('etapes', ({ pool, params }) => getEtapesByDemarcheId(pool, params.demarcheId)),
    Effect.bind('demarche', ({ pool, params }) => getDemarcheByIdOrSlugDb(pool, params.demarcheId)),
    Effect.tap(({ etapes, demarche, user }) => {
      const result = canPublishResultatMiseEnConcurrence(user, demarche.titre_type_id, demarche.demarche_type_id, etapes, demarche.demarche_id)
      if (result.valid) {
        return Effect.succeed(null)
      } else {
        return Effect.fail({ message: 'droits insuffisants' as const, detail: result.error })
      }
    }),
    Effect.flatMap(({ pool, params, user }) => getDemarchePivotEnConcurrence(pool, params.demarcheId, user)),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr("La démarche n'existe pas", () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })),
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", 'Les données en base ne correspondent pas à ce qui est attendu', () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
        Match.when('droits insuffisants', () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.exhaustive
      )
    )
  )
}
