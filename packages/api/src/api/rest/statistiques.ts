import { CustomResponse } from './express-type'
import express from 'express'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { userGet } from '../../database/queries/utilisateurs'
import { IUser } from '../../types'
import { constants } from 'http2'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { checkValideAnnee } from 'camino-common/src/date'
import { knex } from '../../knex'

const anneeDepartStats = 2015

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
    const result: StatistiquesDGTM = { depotEtInstructions: {} }

    const phaseOctrois: { dateDebut: string; typeId: TitreTypeId }[] =
      await knex
        .select('titresPhases.dateDebut', 'titres.typeId')
        .from('titresPhases')
        .leftJoin('titresDemarches', 'titreDemarcheId', 'titresDemarches.id')
        .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
        .where('titresDemarches.typeId', 'oct')
        .andWhere('titresPhases.dateDebut', '>=', `${anneeDepartStats}-01-01`)

    phaseOctrois?.forEach(phase => {
      const annee = phase.dateDebut.substring(0, 4)
      checkValideAnnee(annee)

      if (!result.depotEtInstructions[annee]) {
        result.depotEtInstructions[annee] = {
          totalAXMDeposees: 0,
          totalAXMOctroyees: 0,
          totalTitresDeposes: 0,
          totalTitresOctroyes: 0
        }
      }

      result.depotEtInstructions[annee].totalTitresOctroyes++

      if (phase.typeId === 'axm') {
        result.depotEtInstructions[annee].totalAXMOctroyees++
      }
    })

    const etapeDeposees: { date: string; typeId: TitreTypeId }[] = await knex
      .select('titresEtapes.date', 'titres.typeId')
      .from('titresEtapes')
      .leftJoin('titresDemarches', 'titreDemarcheId', 'titresDemarches.id')
      .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
      .where('titresEtapes.typeId', 'mdp')
      .andWhere('titresDemarches.typeId', 'oct')
      .andWhere('titresEtapes.date', '>=', `${anneeDepartStats}-01-01`)

    etapeDeposees?.forEach(etape => {
      const annee = etape.date.substring(0, 4)
      checkValideAnnee(annee)

      if (!result.depotEtInstructions[annee]) {
        result.depotEtInstructions[annee] = {
          totalAXMDeposees: 0,
          totalAXMOctroyees: 0,
          totalTitresDeposes: 0,
          totalTitresOctroyes: 0
        }
      }

      result.depotEtInstructions[annee].totalTitresDeposes++

      if (etape.typeId === 'axm') {
        result.depotEtInstructions[annee].totalAXMDeposees++
      }
    })

    res.json(result)
  }
}
