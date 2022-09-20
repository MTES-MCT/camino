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
import { SDOMZoneId, SDOMZoneIds } from 'camino-common/src/static/sdom'

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
    const result: StatistiquesDGTM = { depotEtInstructions: {}, sdom: {} }

    const phaseOctrois: {
      id: string
      dateDebut: string
      typeId: TitreTypeId
      sdomZoneId: SDOMZoneId | null
    }[] = await knex
      .select(
        'titresPhases.dateDebut',
        'titres.typeId',
        'titres__sdom_zones.sdom_zone_id'
      )
      .distinct('titres.id')
      .from('titresPhases')
      .leftJoin('titresDemarches', 'titreDemarcheId', 'titresDemarches.id')
      .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
      .leftJoin(
        'titresAdministrationsGestionnaires',
        'titres.id',
        'titresAdministrationsGestionnaires.titreId'
      )
      .leftJoin(
        'titresAdministrations',
        'titres.id',
        'titresAdministrations.titreId'
      )
      .joinRaw(
        "left join titres_administrations_locales on titres_administrations_locales.titre_etape_id = titres.props_titre_etapes_ids ->> 'administrations'"
      )
      .joinRaw(
        "left join titres__sdom_zones on titres__sdom_zones.titre_etape_id = titres.props_titre_etapes_ids ->> 'points'"
      )
      .where('titresDemarches.typeId', 'oct')
      .andWhere('titresPhases.dateDebut', '>=', `${anneeDepartStats}-01-01`)
      .andWhere(builder =>
        builder
          .where(
            'titresAdministrationsGestionnaires.administrationId',
            administrationId
          )
          .orWhere(
            'titresAdministrationsLocales.administrationId',
            administrationId
          )
          .orWhere('titresAdministrations.administrationId', administrationId)
      )

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
      if (!result.sdom[annee]) {
        result.sdom[annee] = {
          [SDOMZoneIds.Zone0]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone0Potentielle]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone1]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone2]: { depose: 0, octroye: 0 }
        }
      }

      result.depotEtInstructions[annee].totalTitresOctroyes++
      if (phase.sdomZoneId !== null) {
        result.sdom[annee][phase.sdomZoneId].octroye++
      }
      if (phase.typeId === 'axm') {
        result.depotEtInstructions[annee].totalAXMOctroyees++
      }
    })

    const etapeDeposees: {
      date: string
      typeId: TitreTypeId
      sdomZoneId: SDOMZoneId | null
    }[] = await knex
      .select(
        'titresEtapes.date',
        'titres.typeId',
        'titres__sdom_zones.sdom_zone_id'
      )
      .distinct('titres.id')
      .from('titresEtapes')
      .leftJoin('titresDemarches', 'titreDemarcheId', 'titresDemarches.id')
      .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
      .leftJoin(
        'titresAdministrationsGestionnaires',
        'titres.id',
        'titresAdministrationsGestionnaires.titreId'
      )
      .leftJoin(
        'titresAdministrations',
        'titres.id',
        'titresAdministrations.titreId'
      )
      .joinRaw(
        "left join titres_administrations_locales on titres_administrations_locales.titre_etape_id = titres.props_titre_etapes_ids ->> 'administrations'"
      )
      .joinRaw(
        "left join titres__sdom_zones on titres__sdom_zones.titre_etape_id = titres.props_titre_etapes_ids ->> 'points'"
      )
      .where('titresEtapes.typeId', 'mdp')
      .andWhere('titresDemarches.typeId', 'oct')
      .andWhere('titresEtapes.date', '>=', `${anneeDepartStats}-01-01`)
      .andWhere(builder =>
        builder
          .where(
            'titresAdministrationsGestionnaires.administrationId',
            administrationId
          )
          .orWhere(
            'titresAdministrationsLocales.administrationId',
            administrationId
          )
          .orWhere('titresAdministrations.administrationId', administrationId)
      )

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

      if (!result.sdom[annee]) {
        result.sdom[annee] = {
          [SDOMZoneIds.Zone0]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone0Potentielle]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone1]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone2]: { depose: 0, octroye: 0 }
        }
      }

      result.depotEtInstructions[annee].totalTitresDeposes++
      if (etape.sdomZoneId !== null) {
        result.sdom[annee][etape.sdomZoneId].depose++
      }

      if (etape.typeId === 'axm') {
        result.depotEtInstructions[annee].totalAXMDeposees++
      }
    })

    res.json(result)
  }
}
