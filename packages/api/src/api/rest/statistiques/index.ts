import { CustomResponse } from '../express-type.js'
import express from 'express'
import {
  StatistiquesMinerauxMetauxMetropole,
  StatistiquesDGTM,
  StatistiquesGuyaneData,
  StatistiquesGranulatsMarins
} from 'camino-common/src/statistiques.js'
import { getMinerauxMetauxMetropolesStatsInside } from './metaux-metropole.js'

import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { constants } from 'http2'
import { getDGTMStatsInside } from './dgtm.js'
import { getGuyaneStatsInside } from './guyane.js'
import { isAdministration, User } from 'camino-common/src/roles.js'
import { statistiquesGranulatsMarins } from './granulats-marins.js'

export const getDGTMStats = async (
  req: express.Request,
  res: CustomResponse<StatistiquesDGTM>
) => {
  const user = req.user as User

  const administrationId = ADMINISTRATION_IDS['DGTM - GUYANE']

  if (!isAdministration(user) || user?.administrationId !== administrationId) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const result = await getDGTMStatsInside(administrationId)

    res.json(result)
  }
}

export const getMinerauxMetauxMetropolesStats = async (
  _req: express.Request,
  res: CustomResponse<StatistiquesMinerauxMetauxMetropole>
): Promise<void> => {
  try {
    res.json(await getMinerauxMetauxMetropolesStatsInside())
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const getGuyaneStats = async (
  _req: express.Request,
  res: CustomResponse<StatistiquesGuyaneData>
): Promise<void> => {
  try {
    res.json(await getGuyaneStatsInside())
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const getGranulatsMarinsStats = async (
  _req: express.Request,
  res: CustomResponse<StatistiquesGranulatsMarins>
): Promise<void> => {
  try {
    res.json(await statistiquesGranulatsMarins())
  } catch (e) {
    console.error(e)

    throw e
  }
}
