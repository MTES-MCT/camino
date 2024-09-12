import { AdministrationId } from 'camino-common/src/static/administrations'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { getTitreTypeIdsByAdministration } from 'camino-common/src/static/administrationsTitresTypes'
import { StatistiquesDGTM, TitreTypeIdDelai, titreTypeIdDelais } from 'camino-common/src/statistiques'
import { CaminoAnnee, CaminoDate, getAnnee, daysBetween, toCaminoAnnee } from 'camino-common/src/date'
import { knex } from '../../../knex'
import { SDOMZoneId, SDOMZoneIds } from 'camino-common/src/static/sdom'
import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { getProductionOr } from './dgtm.queries'
import type { Pool } from 'pg'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

const anneeDepartStats = 2015

export const getDGTMStatsInside =
  (pool: Pool) =>
  async (administrationId: AdministrationId): Promise<StatistiquesDGTM> => {
    const result: StatistiquesDGTM = {
      depotEtInstructions: {},
      sdom: {},
      delais: {},
      producteursOr: {},
      avisAXM: {},
    }

    const gestionnaireTitreTypeIds: TitreTypeId[] = getTitreTypeIdsByAdministration(administrationId)
      .filter(({ gestionnaire, associee }) => gestionnaire || associee)
      .map(({ titreTypeId }) => titreTypeId)

    const demarcheOctrois: {
      id: string
      demarcheDateDebut: CaminoDate
      typeId: TitreTypeId
      sdomZoneIds: SDOMZoneId[] | null
    }[] = await knex
      .select('titresDemarches.demarcheDateDebut', 'titres.typeId', 'titres_etapes.sdom_zones as sdomZoneIds')
      .distinct('titres.id')
      .from('titresDemarches')
      .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
      .joinRaw("left join titres_etapes on titres_etapes.id = titres.props_titre_etapes_ids ->> 'points'")
      .where('titresDemarches.typeId', 'oct')
      .andWhere('titresDemarches.demarcheDateDebut', '>=', `${anneeDepartStats}-01-01`)
      .andWhere(builder => {
        builder.whereRaw(`titres_etapes.administrations_locales @> '"${administrationId}"'::jsonb`)
        if (gestionnaireTitreTypeIds.length) {
          builder.orWhereRaw(`?? in (${gestionnaireTitreTypeIds.map(t => `'${t}'`).join(',')})`, [`titres.typeId`])
        }
      })

    demarcheOctrois?.forEach(demarche => {
      const annee = getAnnee(demarche.demarcheDateDebut)
      if (!result.depotEtInstructions[annee]) {
        result.depotEtInstructions[annee] = {
          totalAXMDeposees: 0,
          totalAXMOctroyees: 0,
          totalTitresDeposes: 0,
          totalTitresOctroyes: 0,
        }
      }
      if (!result.sdom[annee]) {
        result.sdom[annee] = {
          [SDOMZoneIds.Zone0]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone0Potentielle]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone1]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone2]: { depose: 0, octroye: 0 },
          3: { depose: 0, octroye: 0 },
        }
      }

      const anneeDepot = result.depotEtInstructions[annee]
      const anneeSdom = result.sdom[annee]
      if (isNotNullNorUndefined(anneeDepot) && isNotNullNorUndefined(anneeSdom)) {
        anneeDepot.totalTitresOctroyes++
        if (!demarche.sdomZoneIds || demarche.sdomZoneIds.length === 0) {
          anneeSdom['3'].octroye++
        } else {
          demarche.sdomZoneIds.forEach(zoneId => anneeSdom[zoneId].octroye++)
        }
        if (demarche.typeId === 'axm') {
          anneeDepot.totalAXMOctroyees++
        }
      }
    })

    const etapeDeposees: {
      date: CaminoDate
      typeId: TitreTypeId
      sdomZoneIds: SDOMZoneId[] | null
    }[] = await knex
      .select('titresEtapes.date', 'titres.typeId', 'titre_etape_point.sdom_zones as sdomZoneIds')
      .distinct('titres.id')
      .from('titresEtapes')
      .leftJoin('titresDemarches', 'titreDemarcheId', 'titresDemarches.id')
      .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
      .joinRaw("left join titres_etapes titre_etape_point on titre_etape_point.id = titres.props_titre_etapes_ids ->> 'points'")
      .where('titresEtapes.archive', false)
      .where('titresEtapes.typeId', 'mdp')
      .andWhere('titresDemarches.typeId', 'oct')
      .andWhere('titresEtapes.date', '>=', `${anneeDepartStats}-01-01`)
      .andWhere(builder => {
        builder.whereRaw(`titre_etape_point.administrations_locales @> '"${administrationId}"'::jsonb`)
        if (gestionnaireTitreTypeIds.length) {
          builder.orWhereRaw(`?? in (${gestionnaireTitreTypeIds.map(t => `'${t}'`).join(',')})`, [`titres.typeId`])
        }
      })

    etapeDeposees?.forEach(etape => {
      const annee = getAnnee(etape.date)

      if (!result.depotEtInstructions[annee]) {
        result.depotEtInstructions[annee] = {
          totalAXMDeposees: 0,
          totalAXMOctroyees: 0,
          totalTitresDeposes: 0,
          totalTitresOctroyes: 0,
        }
      }

      if (!result.sdom[annee]) {
        result.sdom[annee] = {
          [SDOMZoneIds.Zone0]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone0Potentielle]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone1]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone2]: { depose: 0, octroye: 0 },
          3: { depose: 0, octroye: 0 },
        }
      }

      const anneeDepot = result.depotEtInstructions[annee]
      const anneeSdom = result.sdom[annee]
      if (isNotNullNorUndefined(anneeDepot) && isNotNullNorUndefined(anneeSdom)) {
        anneeDepot.totalTitresDeposes++
        if (!etape.sdomZoneIds || etape.sdomZoneIds.length === 0) {
          anneeSdom[3].depose++
        } else {
          etape.sdomZoneIds.forEach(zoneId => anneeSdom[zoneId].depose++)
        }

        if (etape.typeId === 'axm') {
          anneeDepot.totalAXMDeposees++
        }
      }
    })

    const requeteDelais: {
      id: string
      titretypeid: TitreTypeIdDelai
      depotdelademandedate: CaminoDate
      apo: CaminoDate | null
      decisionadministration: CaminoDate | null
    }[] = await knex
      .select({
        id: 'titres.id',
        titretypeid: 'titres.type_id',
        depotdelademandedate: 'depot_de_la_demande.date',
        apo: 'APO.date',
        decisionadministration: 'decision_administration.date',
      })
      .distinct('titresDemarches.id')
      .from({
        titresDemarches: 'titresDemarches',
      })
      .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
      .joinRaw("left join titres_etapes on titres_etapes.id = titres.props_titre_etapes_ids ->> 'points'")
      .joinRaw(`left join titres_etapes depot_de_la_demande on (depot_de_la_demande.titre_demarche_id = "titres_demarches"."id" and depot_de_la_demande.type_id = '${ETAPES_TYPES.depotDeLaDemande}')`)
      .joinRaw(`left join titres_etapes APO on (APO.titre_demarche_id = "titres_demarches"."id" and APO.type_id = '${ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_}')`)
      .joinRaw(
        `left join titres_etapes decision_administration on (decision_administration.titre_demarche_id = "titres_demarches"."id" and decision_administration.type_id = '${ETAPES_TYPES.decisionDeLadministration}')`
      )
      .where('titresDemarches.typeId', 'oct')
      .whereRaw(`titres.type_id in (${titreTypeIdDelais.map(t => `'${t}'`).join(',')})`)
      .andWhere('depot_de_la_demande.date', '>=', `${anneeDepartStats}-01-01`)
      .andWhere(builder => {
        builder.whereRaw(`titres_etapes.administrations_locales @> '"${administrationId}"'::jsonb`)
        if (gestionnaireTitreTypeIds.length) {
          builder.orWhereRaw(`?? in (${gestionnaireTitreTypeIds.map(t => `'${t}'`).join(',')})`, [`titres.typeId`])
        }
      })

    requeteDelais.forEach(instruction => {
      const annee = getAnnee(instruction.depotdelademandedate)
      if (!result.delais[annee]) {
        result.delais[annee] = {
          axm: {
            delaiInstructionEnJours: [],
            delaiCommissionDepartementaleEnJours: [],
            delaiDecisionPrefetEnJours: [],
          },
          prm: {
            delaiInstructionEnJours: [],
            delaiCommissionDepartementaleEnJours: [],
            delaiDecisionPrefetEnJours: [],
          },
          cxm: {
            delaiInstructionEnJours: [],
            delaiCommissionDepartementaleEnJours: [],
            delaiDecisionPrefetEnJours: [],
          },
        }
      }
      if (instruction.decisionadministration) {
        let days = daysBetween(instruction.depotdelademandedate, instruction.decisionadministration)
        if (days < 0) {
          console.warn('cette demarche a une dex AVANT le depot', instruction.id)
          days = Math.abs(days)
        }
        const delaiAnnee = result.delais[annee]
        if (isNotNullNorUndefined(delaiAnnee) && delaiAnnee[instruction.titretypeid]) {
          delaiAnnee[instruction.titretypeid]?.delaiInstructionEnJours.push(days)
        }
      }

      if (instruction.apo) {
        let days = daysBetween(instruction.depotdelademandedate, instruction.apo)
        if (days < 0) {
          console.warn('cette demarche a une apo AVANT le depot', instruction.id)
          days = Math.abs(days)
        }
        const delaiAnnee = result.delais[annee]
        if (isNotNullNorUndefined(delaiAnnee) && delaiAnnee[instruction.titretypeid]) {
          delaiAnnee[instruction.titretypeid]?.delaiCommissionDepartementaleEnJours.push(days)
        }
        if (instruction.decisionadministration) {
          days = daysBetween(instruction.apo, instruction.decisionadministration)
          if (days < 0) {
            console.warn('cette demarche a une decisionadministration AVANT la commission départementale des mines', instruction.id)
            days = Math.abs(days)
          }
          const delaiAnnee = result.delais[annee]
          if (isNotNullNorUndefined(delaiAnnee) && delaiAnnee[instruction.titretypeid]) {
            delaiAnnee[instruction.titretypeid]?.delaiDecisionPrefetEnJours.push(days)
          }
        }
      }
    })

    const producteursOr = await getProductionOr(pool)

    if (isNotNullNorUndefinedNorEmpty(producteursOr)) {
      result.producteursOr = producteursOr.reduce<Record<CaminoAnnee, number>>((acc, r) => {
        if (isNotNullNorUndefinedNorEmpty(r.annee) && r.count) {
          acc[toCaminoAnnee(r.annee)] = r.count
        }

        return acc
      }, {})
    }

    const avisAXM: {
      rows: {
        annee: CaminoAnnee
        type_id: Extract<EtapeTypeId, 'apd' | 'apo'>
        statut_id: Extract<EtapeStatutId, 'dre' | 'fav' | 'fre' | 'def' | 'ajo'>
        count: string
      }[]
    } = await knex.raw(`select substring(te.date, 0, 5) as annee, te.type_id, te.statut_id, count(*)
  from titres_etapes te
  left join titres_demarches td on te.titre_demarche_id = td.id
  left join titres t on td.titre_id = t.id
  left join titres_etapes te_admin on t.props_titre_etapes_ids->>'points' = te_admin.id
  where te.type_id in ('${ETAPES_TYPES.rapportEtAvisDeLaDREAL}', '${ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_}')
  and te_admin.administrations_locales @> '"${administrationId}"'::jsonb
  and te.date >= '${anneeDepartStats}-01-01'
  group by (substring(te.date, 0, 5), te.type_id, te.statut_id)`)

    if (avisAXM?.rows?.length) {
      result.avisAXM = avisAXM.rows.reduce<StatistiquesDGTM['avisAXM']>((acc, r) => {
        ;(acc[r.annee] ??= {
          apd: { fav: 0, def: 0, dre: 0, fre: 0, ajo: 0 },
          apo: { fav: 0, def: 0, dre: 0, fre: 0, ajo: 0 },
        })[r.type_id][r.statut_id] = parseInt(r.count)

        return acc
      }, {})
    }

    return result
  }
