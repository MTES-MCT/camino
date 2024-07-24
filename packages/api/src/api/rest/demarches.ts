import { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { CaminoRequest, CustomResponse } from './express-type'
import { demarcheIdOrSlugValidator } from 'camino-common/src/demarche'
import { getDemarcheByIdOrSlug as getDemarcheByIdOrSlugDb } from './demarches.queries'
import { GetDemarcheByIdOrSlugValidator, getDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { getAdministrationsLocalesByTitreId, getTitreByIdOrSlug, getTitulairesAmodiatairesByTitreId } from './titres.queries'
import { memoize } from 'camino-common/src/typescript-tools'
import { canReadDemarche } from './permissions/demarches'

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
