import { AdministrationId } from 'camino-common/src/static/administrations'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { CaminoDate, getAnnee, daysBetween } from 'camino-common/src/date'
import { knex } from '../../../knex'
import { SDOMZoneId, SDOMZoneIds } from 'camino-common/src/static/sdom'

const anneeDepartStats = 2015

export const getDGTMStatsInside = async (
  administrationId: AdministrationId
): Promise<StatistiquesDGTM> => {
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
    .joinRaw(
      "left join titres_etapes on titres_etapes.id = titres.props_titre_etapes_ids ->> 'points'"
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
        .orWhereRaw(
          `titres_etapes.administrations_locales @> '"${administrationId}"'::jsonb`
        )
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
    .joinRaw(
      "left join titres_etapes titre_etape_point on titre_etape_point.id = titres.props_titre_etapes_ids ->> 'points'"
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
        .orWhereRaw(
          `titre_etape_point.administrations_locales @> '"${administrationId}"'::jsonb`
        )
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
    .joinRaw(
      "left join titres_etapes on titres_etapes.id = titres.props_titre_etapes_ids ->> 'points'"
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
        .orWhereRaw(
          `titres_etapes.administrations_locales @> '"${administrationId}"'::jsonb`
        )
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
    .joinRaw(
      "left join titres_etapes on titres_etapes.id = titres.props_titre_etapes_ids ->> 'points'"
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
        .orWhereRaw(
          `titres_etapes.administrations_locales @> '"${administrationId}"'::jsonb`
        )
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

  return result
}