import { CustomResponse } from '../express-type'
import express from 'express'
import {
  StatistiquesMinerauxMetauxMetropole,
  StatistiquesDGTM,
  StatistiquesGuyane
} from 'camino-common/src/statistiques'
import { getMinerauxMetauxMetropolesStatsInside } from './metaux-metropole'

import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { userGet } from '../../../database/queries/utilisateurs'
import { IUser } from '../../../types'
import { constants } from 'http2'
import { getDGTMStatsInside } from './dgtm'
import { getGuyaneStatsInside } from './guyane'

export const getDGTMStats = async (
  req: express.Request,
  res: CustomResponse<StatistiquesDGTM>
) => {
  const userId = (req.user as unknown as IUser | undefined)?.id

  const user = await userGet(userId)

  const administrationId = ADMINISTRATION_IDS['DGTM - GUYANE']

  if (user?.administrationId !== administrationId) {
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
  res: CustomResponse<StatistiquesGuyane>
): Promise<void> => {
  try {
    res.json(await getGuyaneStatsInside())
  } catch (e) {
    console.error(e)

    throw e
  }
}
