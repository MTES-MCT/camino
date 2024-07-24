import { CaminoRequest, CustomResponse } from '../express-type'
import { StatistiquesMinerauxMetauxMetropole, StatistiquesDGTM, StatistiquesGuyaneData, StatistiquesGranulatsMarins } from 'camino-common/src/statistiques'
import { getMinerauxMetauxMetropolesStatsInside } from './metaux-metropole'

import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { HTTP_STATUS } from 'camino-common/src/http'
import { getDGTMStatsInside } from './dgtm'
import { getGuyaneStatsInside } from './guyane'
import { isAdministration } from 'camino-common/src/roles'
import { statistiquesGranulatsMarins } from './granulats-marins'
import { caminoAnneeValidator, getCurrentAnnee } from 'camino-common/src/date'
import type { Pool } from 'pg'

export const getDGTMStats = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<StatistiquesDGTM>) => {
  const user = req.auth

  const administrationId = ADMINISTRATION_IDS['DGTM - GUYANE']

  if (!isAdministration(user) || user?.administrationId !== administrationId) {
    res.sendStatus(HTTP_STATUS.FORBIDDEN)
  } else {
    const result = await getDGTMStatsInside(pool)(administrationId)

    res.json(result)
  }
}

export const getMinerauxMetauxMetropolesStats =
  (pool: Pool) =>
  async (_req: CaminoRequest, res: CustomResponse<StatistiquesMinerauxMetauxMetropole>): Promise<void> => {
    try {
      res.json(await getMinerauxMetauxMetropolesStatsInside(pool))
    } catch (e) {
      console.error(e)

      throw e
    }
  }

export const getGuyaneStats =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<StatistiquesGuyaneData>): Promise<void> => {
    try {
      const annee = caminoAnneeValidator.optional().nullable().parse(req.params.annee)
      res.json(await getGuyaneStatsInside(pool, annee ?? getCurrentAnnee()))
    } catch (e) {
      console.error(e)

      throw e
    }
  }

export const getGranulatsMarinsStats =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<StatistiquesGranulatsMarins>): Promise<void> => {
    try {
      const annee = caminoAnneeValidator.optional().nullable().parse(req.params.annee)
      res.json(await statistiquesGranulatsMarins(annee ?? getCurrentAnnee()))
    } catch (e) {
      console.error(e)

      throw e
    }
  }
