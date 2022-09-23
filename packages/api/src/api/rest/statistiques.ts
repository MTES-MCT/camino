import { CustomResponse } from './express-type'
import express from 'express'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { userGet } from '../../database/queries/utilisateurs'
import { ITitre, IUser } from '../../types'
import { constants } from 'http2'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import {
  StatistiquesDGTM,
  StatistiquesMetauxMinerauxMetropole
} from 'camino-common/src/statistiques'
import { CaminoDate, getAnnee, daysBetween } from 'camino-common/src/date'
import { knex } from '../../knex'
import { SDOMZoneId, SDOMZoneIds } from 'camino-common/src/static/sdom'
import { userSuper } from '../../database/user-super'
import { titresGet } from '../../database/queries/titres'

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
    const result: StatistiquesDGTM = {
      depotEtInstructions: {},
      sdom: {},
      delais: {}
    }

    const phaseOctrois: {
      id: string
      dateDebut: CaminoDate
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
      const annee = getAnnee(phase.dateDebut)

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
      date: CaminoDate
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
      const annee = getAnnee(etape.date)

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

    const dateInstruction: {
      id: string
      mcrdate: CaminoDate
      dexdate: CaminoDate
    }[] = await knex
      .select({
        mcrdate: 'MCR.date',
        dexdate: 'DEX.date'
      })
      .distinct('titresDemarches.id')
      .from({
        MCR: 'titresEtapes',
        DEX: 'titresEtapes',
        titresDemarches: 'titresDemarches'
      })
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
      .andWhereRaw('MCR.titre_demarche_id = "titres_demarches"."id"')
      .andWhere('MCR.typeId', 'mcr')
      .andWhere('MCR.date', '>=', `${anneeDepartStats}-01-01`)
      .andWhereRaw('DEX.titre_demarche_id = "titres_demarches"."id"')
      .andWhere('DEX.typeId', 'dex')
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

    dateInstruction.forEach(instruction => {
      const annee = getAnnee(instruction.mcrdate)
      if (!result.delais[annee]) {
        result.delais[annee] = {
          delaiInstructionEnJours: [],
          delaiCommissionDepartementaleEnJours: []
        }
      }
      let days = daysBetween(instruction.mcrdate, instruction.dexdate)
      if (days < 0) {
        console.warn('cette demarche a une dex AVANT la mcr', instruction.id)
        days = Math.abs(days)
      }
      result.delais[annee].delaiInstructionEnJours.push(days)
    })

    const dateCDM: {
      id: string
      mcrdate: CaminoDate
      apo: CaminoDate
    }[] = await knex
      .select({ mcrdate: 'MCR.date', apo: 'APO.date' })
      .distinct('titresDemarches.id')
      .from({
        MCR: 'titresEtapes',
        APO: 'titresEtapes',
        titresDemarches: 'titresDemarches'
      })
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
      .andWhereRaw('MCR.titre_demarche_id = "titres_demarches"."id"')
      .andWhere('MCR.typeId', 'mcr')
      .andWhere('MCR.date', '>=', `${anneeDepartStats}-01-01`)
      .andWhereRaw('APO.titre_demarche_id = "titres_demarches"."id"')
      .andWhere('APO.typeId', 'apo')
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

    dateCDM.forEach(instruction => {
      const annee = getAnnee(instruction.mcrdate)
      if (!result.delais[annee]) {
        result.delais[annee] = {
          delaiInstructionEnJours: [],
          delaiCommissionDepartementaleEnJours: []
        }
      }
      let days = daysBetween(instruction.mcrdate, instruction.apo)
      if (days < 0) {
        console.warn('cette demarche a une apo AVANT la mcr', instruction.id)
        days = Math.abs(days)
      }
      result.delais[annee].delaiCommissionDepartementaleEnJours.push(days)
    })

    res.json(result)
  }
}

// TODO 2022-09-23 better type
const isTitreGoodType = (
  typeId: TitreTypeId
): typeId is 'axm' | 'prm' | 'axm' | 'pxm' | 'cxm' => {
  return ['axm', 'prm', 'axm', 'pxm', 'cxm'].includes(typeId)
}

const statistiquesMetauxMinerauxMetropoleInstantBuild = (
  titres: ITitre[]
): StatistiquesMetauxMinerauxMetropole => {
  const statsInstant = titres.reduce(
    (acc, titre) => {
      if (
        titre.titreStatutId &&
        ['val', 'mod'].includes(titre.titreStatutId) &&
        titre.surfaceEtape &&
        titre.surfaceEtape.surface
      ) {
        if (['arm', 'prm'].includes(titre.typeId)) {
          acc.surfaceExploration += titre.surfaceEtape.surface
        } else {
          acc.surfaceExploitation += titre.surfaceEtape.surface
        }

        if (isTitreGoodType(titre.typeId)) {
          acc.titres[titre.typeId]++
        }
      }

      return acc
    },
    {
      surfaceExploration: 0,
      surfaceExploitation: 0,
      titres: {
        arm: 0,
        prm: 0,
        axm: 0,
        pxm: 0,
        cxm: 0
      }
    }
  )

  statsInstant.surfaceExploration = Math.floor(
    statsInstant.surfaceExploration * 100
  ) // conversion 1 km² = 100 ha
  statsInstant.surfaceExploitation = Math.floor(
    statsInstant.surfaceExploitation * 100
  ) // conversion 1 km² = 100 ha

  return statsInstant
}
export const getMetauxMinerauxMetropolesStats = async (
  _req: express.Request,
  res: CustomResponse<StatistiquesMetauxMinerauxMetropole>
) => {
  try {
    // const anneeCurrent = new Date().getFullYear()
    // // un tableau avec les 5 dernières années
    // const annees = Array.from(Array(6).keys())
    //   .map(e => anneeCurrent - e)
    //   .reverse()

    const titres = await titresGet(
      {
        domainesIds: ['m'],
        typesIds: ['ar', 'pr', 'ax', 'px', 'cx']
        // FIXME PAS LA GUYANE territoires: 'france'
      },
      {
        fields: {
          surfaceEtape: { id: {} },
          demarches: { phase: { id: {} }, etapes: { id: {} }, type: { id: {} } }
        }
      },
      userSuper
    )

    // const titresActivites = await titresActivitesGet(
    // { titresTerritoires: 'guyane', annees, typesIds: ['grp', 'gra', 'grx'] },
    // { fields: { titre: { id: {} } } },
    // userSuper
    // )

    res.json(statistiquesMetauxMinerauxMetropoleInstantBuild(titres))
  } catch (e) {
    console.error(e)

    res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
  }
}
