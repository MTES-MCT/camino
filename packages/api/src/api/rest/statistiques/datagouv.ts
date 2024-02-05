import { Pool } from 'pg'
import { CaminoRequest, CustomResponse } from '../express-type'
import { StatistiquesDataGouv, indicateurByAdministrationId } from 'camino-common/src/statistiques.js'
import { getUtilisateursStats } from './datagouv.queries.js'
import { isEntrepriseOrBureauDetudeRole } from 'camino-common/src/roles.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { Administrations } from 'camino-common/src/static/administrations.js'
import { CaminoStatistiquesDataGouv, CaminoStatistiquesDataGouvId } from 'camino-common/src/static/statistiques.js'
import { getCurrent } from 'camino-common/src/date.js'

const commonIndicateurValues: Pick<
  StatistiquesDataGouv,
  'administration_rattachement' | 'nom_service_public_numerique' | 'est_cible' | 'est_periode' | 'est_automatise' | 'source_collecte' | 'code_insee'
> = {
  administration_rattachement: 'DGALN',
  nom_service_public_numerique: 'CAMINO',
  est_cible: false,
  est_periode: true,
  est_automatise: true,
  source_collecte: 'script',
  code_insee: '',
}

export const getDataGouvStats =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<StatistiquesDataGouv[]>): Promise<void> => {
    try {
      const result: StatistiquesDataGouv[] = []

      const utilisateursInDb = await getUtilisateursStats(pool)

      const utilisateurs: Record<CaminoStatistiquesDataGouvId, number> = utilisateursInDb.reduce<Record<CaminoStatistiquesDataGouvId, number>>(
        (previousValue, user) => {
          if (isNotNullNorUndefined(user.administration_id)) {
            const administrationTypeId = Administrations[user.administration_id].typeId
            if (administrationTypeId !== 'ope') {
              previousValue[indicateurByAdministrationId[administrationTypeId]]++
            } else {
              previousValue["Nombre d'utilisateurs sur la plateforme"]++
            }
          } else if (isEntrepriseOrBureauDetudeRole(user.role)) {
            previousValue["Nombre d'utilisateurs affiliés à une entreprise"]++
          } else {
            previousValue["Nombre d'utilisateurs sur la plateforme"]++
          }

          return previousValue
        },
        {
          "Nombre d'utilisateurs rattachés à une Autorité": 0,
          "Nombre d'utilisateurs rattachés à une Dréal": 0,
          "Nombre d'utilisateurs rattachés à une Déal": 0,
          "Nombre d'utilisateurs rattachés à un ministère": 0,
          "Nombre d'utilisateurs rattachés à une préfecture": 0,
          "Nombre d'utilisateurs affiliés à une entreprise": 0,
          "Nombre d'utilisateurs sur la plateforme": 0,
        }
      )

      for (const stat of Object.values(CaminoStatistiquesDataGouv)) {
        const indicateur = stat.indicateur

        result.push({ ...stat, ...commonIndicateurValues, valeur: utilisateurs[indicateur], date: getCurrent() })
      }
      res.json(result)
    } catch (e) {
      console.error(e)

      throw e
    }
  }
