import { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { CaminoRequest, CustomResponse } from './express-type'
import { demarcheIdOrSlugValidator, demarcheIdValidator } from 'camino-common/src/demarche'
import { getDemarcheByIdOrSlug as getDemarcheByIdOrSlugDb } from './demarches.queries'
import { GetDemarcheByIdOrSlugValidator, getDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { getAdministrationsLocalesByTitreId, getTitreByIdOrSlug, getTitulairesAmodiatairesByTitreId } from './titres.queries'
import { isNullOrUndefined, memoize } from 'camino-common/src/typescript-tools'
import { canReadDemarche } from './permissions/demarches'
import { titreDemarcheArchive, titreDemarcheGet } from '../../database/queries/titres-demarches'
import { titreDemarcheUpdateTask } from '../../business/titre-demarche-update'
import { canDeleteDemarche } from 'camino-common/src/permissions/titres-demarches'
import { userSuper } from '../../database/user-super'

export const getDemarcheByIdOrSlug = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<GetDemarcheByIdOrSlugValidator>) => {
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

export const demarcheSupprimer = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
  try {
    const demarcheIdParsed = demarcheIdValidator.safeParse(req.params.demarcheId)
    if (!demarcheIdParsed.success) {
      res.status(HTTP_STATUS.BAD_REQUEST)

      return
    }

    const user = req.auth
    const id = demarcheIdParsed.data
    const demarcheOld = await titreDemarcheGet(id, { fields: { titre: { pointsEtape: { id: {} } }, etapes: { id: {} } } }, userSuper)

    if (isNullOrUndefined(demarcheOld)) throw new Error("la démarche n'existe pas")
    const etapes = demarcheOld.etapes
    if (isNullOrUndefined(etapes)) throw new Error('les étapes ne sont pas chargées')
    if (isNullOrUndefined(demarcheOld.titre)) throw new Error("le titre n'existe pas")
    if (isNullOrUndefined(demarcheOld.titre.administrationsLocales)) throw new Error('les administrations locales ne sont pas chargées')

    if (!canDeleteDemarche(user, demarcheOld.titre.typeId, demarcheOld.titre.titreStatutId, demarcheOld.titre.administrationsLocales, { etapes })) throw new Error('droits insuffisants')

    await titreDemarcheArchive(id)

    await titreDemarcheUpdateTask(pool, null, demarcheOld.titreId)
    res.sendStatus(HTTP_STATUS.NO_CONTENT)
  } catch (e) {
    console.error(e)

    res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
