import { CaminoRequest, CustomResponse } from '../express-type.js'
import { StatistiquesMinerauxMetauxMetropole, StatistiquesDGTM, StatistiquesGuyaneData, StatistiquesGranulatsMarins } from 'camino-common/src/statistiques.js'
import { getMinerauxMetauxMetropolesStatsInside } from './metaux-metropole.js'

import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { constants } from 'http2'
import { getDGTMStatsInside } from './dgtm.js'
import { getGuyaneStatsInside } from './guyane.js'
import { isAdministration } from 'camino-common/src/roles.js'
import { statistiquesGranulatsMarins } from './granulats-marins.js'
import type { Pool } from 'pg'

export const getDGTMStats = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<StatistiquesDGTM>) => {
  const user = req.auth

  const administrationId = ADMINISTRATION_IDS['DGTM - GUYANE']

  if (!isAdministration(user) || user?.administrationId !== administrationId) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const result = await getDGTMStatsInside(pool)(administrationId)

    res.json(result)
  }
}

export const getMinerauxMetauxMetropolesStats = async (_req: CaminoRequest, res: CustomResponse<StatistiquesMinerauxMetauxMetropole>): Promise<void> => {
  try {
    res.json(await getMinerauxMetauxMetropolesStatsInside())
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const getGuyaneStats = async (_req: CaminoRequest, res: CustomResponse<StatistiquesGuyaneData>): Promise<void> => {
  try {
    res.json(await getGuyaneStatsInside())
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const getGranulatsMarinsStats = async (_req: CaminoRequest, res: CustomResponse<StatistiquesGranulatsMarins>): Promise<void> => {
  try {
    res.json(await statistiquesGranulatsMarins())
  } catch (e) {
    console.error(e)

    throw e
  }
}
