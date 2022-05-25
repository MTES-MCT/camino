import { userGet } from '../../database/queries/utilisateurs'

import express from 'express'
import { IUser } from '../../types'
import { Fiscalite, fiscaliteVisible } from 'camino-common/src/fiscalite'
import { constants } from 'http2'
import { redevanceCommunaleMinesAurifiereGet } from '../../tools/api-openfisca'

type Send<T = express.Response> = (body?: Fiscalite) => T

interface CustomResponse extends express.Response {
  json: Send<this>
}

export const fiscalite = async (
  req: express.Request<{ entrepriseId?: string }>,
  res: CustomResponse
) => {
  const userId = (req.user as unknown as IUser | undefined)?.id

  const user = await userGet(userId)

  const entrepriseId = req.params.entrepriseId

  if (!entrepriseId || !fiscaliteVisible(user, entrepriseId)) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    // TODO
    const result = await redevanceCommunaleMinesAurifiereGet(
      [{ id: entrepriseId, orNet: { '2022': 1232 } }],
      [2022]
    )

    const redevanceCommunaleMinesAurifiere = result
      ? result[entrepriseId][2022]
      : 0

    res.json({
      redevanceCommunale: redevanceCommunaleMinesAurifiere ?? 0,
      redevanceDepartementale: 330.98,
      taxeAurifereGuyane: 4100.027,
      totalInvestissementsDeduits: 0
    })
  }
}
