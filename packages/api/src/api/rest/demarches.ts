import { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { CaminoRequest, CustomResponse } from './express-type'
import { DemarcheCreationOutput, demarcheIdOrSlugValidator } from 'camino-common/src/demarche'
import { getDemarcheByIdOrSlug as getDemarcheByIdOrSlugDb } from './demarches.queries'
import { GetDemarcheByIdOrSlugValidator, getDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { getAdministrationsLocalesByTitreId, getDemarchesByTitreId, getTitreByIdOrSlug, getTitulairesAmodiatairesByTitreId } from './titres.queries'
import { isNullOrUndefined, memoize } from 'camino-common/src/typescript-tools'
import { canReadDemarche } from './permissions/demarches'
import { titreDemarcheArchive, titreDemarcheCreate, titreDemarcheGet } from '../../database/queries/titres-demarches'
import { titreDemarcheUpdateTask } from '../../business/titre-demarche-update'
import { canCreateDemarche, canCreateTravaux, canDeleteDemarche } from 'camino-common/src/permissions/titres-demarches'
import { userSuper } from '../../database/user-super'
import { RestNewPostCall } from '../../server/rest'
import { Effect, pipe } from 'effect'
import { isDemarcheTypeId, isTravaux } from 'camino-common/src/static/demarchesTypes'
import { titreGet } from '../../database/queries/titres'
import { CaminoApiError } from '../../types'

export const getDemarcheByIdOrSlug =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<GetDemarcheByIdOrSlugValidator>): Promise<void> => {
    try {
      const demarcheIdOrSlugParsed = demarcheIdOrSlugValidator.safeParse(req.params.demarcheIdOrSlug)
      const user = req.auth
      if (!demarcheIdOrSlugParsed.success) {
        res.sendStatus(HTTP_STATUS.BAD_REQUEST)
      } else {
        const demarche = await getDemarcheByIdOrSlugDb(pool, demarcheIdOrSlugParsed.data)
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

export const demarcheCreer: RestNewPostCall<'/rest/demarches'> = (pool, user, demarche): Effect.Effect<DemarcheCreationOutput, CaminoApiError<string>> => {
  return pipe(
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
        if (!titre.titreStatutId) {
          throw new Error('le statut du titre est obligatoire')
        }

        const demarches = await getDemarchesByTitreId(pool, demarche.titreId)

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
}
