import { CustomResponse } from './express-type'
import express from 'express'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { userGet } from '../../database/queries/utilisateurs'
import { IUser } from '../../types'
import { constants } from 'http2'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import {
  FiscaliteParSubstanceParAnnee,
  StatistiquesDGTM,
  StatistiquesMinerauxMetauxMetropole,
  StatistiquesMinerauxMetauxMetropoleSels,
  substancesFiscalesStats
} from 'camino-common/src/statistiques'
import {
  CaminoDate,
  getAnnee,
  daysBetween,
  CaminoAnnee,
  valideAnnee,
  anneeSuivante
} from 'camino-common/src/date'
import { fromUniteFiscaleToUnite } from 'camino-common/src/static/unites'
import { knex } from '../../knex'
import { SDOMZoneId, SDOMZoneIds } from 'camino-common/src/static/sdom'
import { userSuper } from '../../database/user-super'
import { titresGet } from '../../database/queries/titres'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import {
  SubstanceFiscaleId,
  SubstancesFiscale,
  SUBSTANCES_FISCALES_IDS
} from 'camino-common/src/static/substancesFiscales'
import {
  CodePostal,
  Departements,
  toDepartementId
} from 'camino-common/src/static/departement'
import { REGION_IDS } from 'camino-common/src/static/region'
import {
  apiOpenfiscaCalculate,
  OpenfiscaRequest,
  redevanceCommunale,
  redevanceDepartementale,
  substanceFiscaleToInput
} from '../../tools/api-openfisca'
import { onlyUnique } from 'camino-common/src/typescript-tools'

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

    res.json(result)
  }
}

type StatistiquesMinerauxMetauxMetropoleInstantBuild = Omit<
  StatistiquesMinerauxMetauxMetropole,
  'substances' | 'fiscaliteParSubstanceParAnnee'
>
const statistiquesMinerauxMetauxMetropoleInstantBuild =
  async (): Promise<StatistiquesMinerauxMetauxMetropoleInstantBuild> => {
    const titres = await titresGet(
      {
        domainesIds: ['m'],
        typesIds: ['ar', 'ap', 'pr', 'ax', 'px', 'cx'],
        territoires: 'FR'
      },
      {
        fields: {
          surfaceEtape: { id: {} },
          demarches: {
            phase: { id: {} },
            etapes: { id: {} },
            type: { id: {} }
          },
          communes: { id: {} }
        }
      },
      userSuper
    )
    const statsInstant: StatistiquesMinerauxMetauxMetropoleInstantBuild =
      titres.reduce(
        (acc, titre) => {
          if (
            titre.titreStatutId &&
            ['val', 'mod', 'dmi'].includes(titre.titreStatutId)
          ) {
            if (!titre.surfaceEtape) {
              console.warn(`ce titre ${titre.slug} n'a pas de surface`)
            }
            if (['arm', 'apm', 'prm'].includes(titre.typeId!)) {
              acc.surfaceExploration += titre.surfaceEtape?.surface ?? 0
              if (['mod', 'dmi'].includes(titre.titreStatutId!)) {
                acc.titres.instructionExploration++
              }
            } else {
              if (['val', 'mod'].includes(titre.titreStatutId)) {
                acc.surfaceExploitation += titre.surfaceEtape?.surface ?? 0
              }
              if (['mod', 'dmi'].includes(titre.titreStatutId!)) {
                acc.titres.instructionExploitation++
              }
            }
            if (TitresStatutIds.Valide === titre.titreStatutId) {
              if (titre.typeId === 'prm') {
                acc.titres.valPrm++
              }
              if (titre.typeId === 'cxm') {
                acc.titres.valCxm++
              }
            }
          }

          return acc
        },
        {
          surfaceExploration: 0,
          surfaceExploitation: 0,
          titres: {
            instructionExploration: 0,
            valPrm: 0,
            instructionExploitation: 0,
            valCxm: 0
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

const sels = [
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_,
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitEnDissolutionParSondage,
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage
] as const
type Sels = typeof sels[number]
export const getMinerauxMetauxMetropolesStats = async (
  _req: express.Request,
  res: CustomResponse<StatistiquesMinerauxMetauxMetropole>
): Promise<void> => {
  try {
    const result = await statistiquesMinerauxMetauxMetropoleInstantBuild()
    const substances = await buildSubstances()
    const fiscaliteParSubstanceParAnnee = await fiscaliteDetail()

    res.json({ ...result, ...substances, fiscaliteParSubstanceParAnnee })
  } catch (e) {
    console.error(e)

    throw e
  }
}

const buildSubstances = async (): Promise<
  Pick<StatistiquesMinerauxMetauxMetropole, 'substances'>
> => {
  const bauxite = SUBSTANCES_FISCALES_IDS.bauxite
  const resultSubstances: { annee: CaminoAnnee; substance: number }[] =
    await knex
      .select(
        'annee',
        knex.raw(
          "titres_activites.contenu->'substancesFiscales'-> ?  as substance",
          bauxite
        )
      )
      .from('titres_activites')
      .whereRaw(
        `titres_activites.contenu -> 'substancesFiscales' \\? '${bauxite}'`
      )

  const bauxiteResult = resultSubstances.reduce<Record<CaminoAnnee, number>>(
    (acc, dateSubstance) => {
      const annee = dateSubstance.annee
      if (!acc[annee]) {
        acc[annee] = 0
      }
      acc[annee] += fromUniteFiscaleToUnite(
        SubstancesFiscale[bauxite].uniteId,
        dateSubstance.substance
      )

      return acc
    },
    {}
  )
  // 2022-09-30 Valeurs fournies par Laure dans mattermost : https://mattermost.incubateur.net/camino/pl/3n4y958n6idwbrr4me5rkma1oy
  bauxiteResult[valideAnnee('2009')] = 178.7
  bauxiteResult[valideAnnee('2010')] = 132.302
  bauxiteResult[valideAnnee('2011')] = 117.7
  bauxiteResult[valideAnnee('2012')] = 65.336
  bauxiteResult[valideAnnee('2013')] = 109.602
  bauxiteResult[valideAnnee('2014')] = 71.07
  bauxiteResult[valideAnnee('2015')] = 80.578
  bauxiteResult[valideAnnee('2016')] = 112.445
  bauxiteResult[valideAnnee('2017')] = 131.012
  bauxiteResult[valideAnnee('2018')] = 138.8
  bauxiteResult[valideAnnee('2019')] = 120.76

  // TODO 2022-10-03 Problème de type postgres (jsonb ou numeric trop gros?), même avec du cast, on obtient des string
  const resultSel: {
    annee: CaminoAnnee
    communeId: CodePostal
    nacc: string
    naca: string
    nacb: string
  }[] = await knex
    .select(
      'titres_activites.annee',
      'tc.commune_id',
      knex.raw(
        "titres_activites.contenu->'substancesFiscales'->'nacc' as nacc"
      ),
      knex.raw(
        "titres_activites.contenu->'substancesFiscales'->'naca' as naca"
      ),
      knex.raw("titres_activites.contenu->'substancesFiscales'->'nacb' as nacb")
    )
    .distinctOn('titres.slug', 'titres_activites.annee')
    .from('titres_activites')
    .leftJoin('titres', 'titres.id', 'titres_activites.titre_id')
    .joinRaw(
      "left join titres_communes tc on tc.titre_etape_id  = titres.props_titre_etapes_ids ->> 'points'"
    )
    .whereRaw("titres_activites.contenu -> 'substancesFiscales' \\? 'nacc'")
    .orWhereRaw("titres_activites.contenu -> 'substancesFiscales' \\? 'nacb'")
    .orWhereRaw("titres_activites.contenu -> 'substancesFiscales' \\? 'naca'")
    .orderBy('titres.slug')

  const selsStats = resultSel.reduce<{
    [key in Sels]: StatistiquesMinerauxMetauxMetropoleSels
  }>(
    (acc, stat) => {
      const annee = stat.annee

      const regionId = Departements[toDepartementId(stat.communeId)].regionId

      for (const substance of sels) {
        if (typeof stat[substance] !== 'number') {
          console.warn(`WTF ${typeof stat[substance]} ${stat[substance]}`)
        }
        if (!acc[substance][annee]) {
          acc[substance][annee] = {}
        }
        const valeur = fromUniteFiscaleToUnite(
          SubstancesFiscale[substance].uniteId,
          parseInt(stat[substance], 10)
        )
        acc[substance][annee][regionId] =
          valeur + (acc[substance][annee][regionId] ?? 0)
      }

      return acc
    },
    {
      [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_]: {},
      [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitEnDissolutionParSondage]:
        {},
      [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage]: {}
    }
  )

  // Valeurs fournies par Laure : https://trello.com/c/d6YDa4Ao/341-cas-france-relance-dashboard-grand-public-compl%C3%A8te-les-statistiques-v3-sel
  selsStats.naca[valideAnnee(2009)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 635.592,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 7.684,
    [REGION_IDS['Grand Est']]: 2692.7,
    [REGION_IDS['Nouvelle-Aquitaine']]: 48.724,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 274.732,
    [REGION_IDS.Occitanie]: 867.001
  }
  selsStats.naca[valideAnnee(2010)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 579.385,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 11.645,
    [REGION_IDS['Grand Est']]: 2995.599,
    [REGION_IDS['Nouvelle-Aquitaine']]: 37.23,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 500.564,
    [REGION_IDS.Occitanie]: 990.091
  }
  selsStats.naca[valideAnnee(2011)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 959.442,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2959.7,
    [REGION_IDS['Nouvelle-Aquitaine']]: 32.425,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 421.48,
    [REGION_IDS.Occitanie]: 958.849
  }
  selsStats.naca[valideAnnee(2012)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 936.78,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2426.62,
    [REGION_IDS['Nouvelle-Aquitaine']]: 35.97,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 1042.67,
    [REGION_IDS.Occitanie]: 797.099
  }
  selsStats.naca[valideAnnee(2013)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 907.994,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2703.049,
    [REGION_IDS['Nouvelle-Aquitaine']]: 37.79,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 1300.854,
    [REGION_IDS.Occitanie]: 1010.892
  }
  selsStats.naca[valideAnnee(2014)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 763.55,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 1552.197,
    [REGION_IDS['Nouvelle-Aquitaine']]: 34.285,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 843.83,
    [REGION_IDS.Occitanie]: 1062.216
  }
  selsStats.naca[valideAnnee(2015)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 799.949,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2444.74,
    [REGION_IDS['Nouvelle-Aquitaine']]: 37.303,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 135.02,
    [REGION_IDS.Occitanie]: 1007.542
  }
  selsStats.naca[valideAnnee(2016)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 830.577,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2377.175,
    [REGION_IDS['Nouvelle-Aquitaine']]: 35.841,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 95.859,
    [REGION_IDS.Occitanie]: 926.388
  }
  selsStats.naca[valideAnnee(2017)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 869.676,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2585.934,
    [REGION_IDS['Nouvelle-Aquitaine']]: 34.219,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 91.718,
    [REGION_IDS.Occitanie]: 1082.021
  }
  selsStats.naca[valideAnnee(2018)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 870.718,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2481.271,
    [REGION_IDS['Nouvelle-Aquitaine']]: 31.71,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 150.524,
    [REGION_IDS.Occitanie]: 997.862
  }
  selsStats.naca[valideAnnee(2019)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 792.394,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2537.412,
    [REGION_IDS['Nouvelle-Aquitaine']]: 36.357,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 196.828,
    [REGION_IDS.Occitanie]: 997.862
  }

  return { substances: { aloh: bauxiteResult, ...selsStats } }
}

const fiscaliteDetail = async (): Promise<FiscaliteParSubstanceParAnnee> => {
  const fakeCommune = '66666'
  const body: OpenfiscaRequest = {
    articles: {
      pme: {
        surface_communale: {}
      },
      autre: {
        surface_communale: {}
      }
    },
    titres: {
      pme: {
        commune_principale_exploitation: {},
        surface_totale: {},
        categorie: {},
        articles: ['pme']
      },
      autre: {
        commune_principale_exploitation: {},
        surface_totale: {},
        categorie: {},
        articles: ['autre']
      }
    },
    communes: {
      [fakeCommune]: {
        articles: ['pme', 'autre']
      }
    }
  }

  const sumSubstances = substancesFiscalesStats
    .map(
      substance =>
        `sum((ta.contenu->'substancesFiscales'->'${substance}')::int) as ${substance}`
    )
    .join(',')
  const whereSubstances = substancesFiscalesStats
    .map(substance => `ta.contenu->'substancesFiscales' \\? '${substance}'`)
    .join('or \n')
  const result: {
    rows: ({
      categorie: 'pme' | 'autre'
      annee: CaminoAnnee
    } & Record<SubstanceFiscaleId, number>)[]
  } = await knex.raw(`
    select case when e_t.categorie = 'PME' then 'pme' else 'autre' end as categorie, ta.annee, ${sumSubstances}
    from titres_activites ta  
    join titres t on t.id = ta.titre_id 
    left join titres_titulaires tt on t.props_titre_etapes_ids ->> 'titulaires' = tt.titre_etape_id
    left join entreprises e_t on e_t.id  = tt.entreprise_id
    where ${whereSubstances}
    group by case when e_t.categorie = 'PME' then 'pme' else 'autre' end, ta.annee
    `)
  const annees: CaminoAnnee[] = []

  result.rows.forEach(row => {
    const annee = row.annee
    const categorie = row.categorie

    annees.push(annee)
    const anneeFiscale = anneeSuivante(annee)
    body.articles[categorie].surface_communale[annee] = 1

    substancesFiscalesStats.forEach((substance: SubstanceFiscaleId) => {
      const substanceFiscale = SubstancesFiscale[substance]
      ;(body.articles[categorie][redevanceCommunale(substanceFiscale)] ??= {})[
        anneeFiscale
      ] = null
      ;(body.articles[categorie][redevanceDepartementale(substanceFiscale)] ??=
        {})[anneeFiscale] = null
      ;(body.articles[categorie][substanceFiscaleToInput(substanceFiscale)] ??=
        {})[annee] = fromUniteFiscaleToUnite(
        substanceFiscale.uniteId,
        row[substance]
      )
    })

    if (!body.titres[categorie]) {
      body.titres[categorie] = {
        commune_principale_exploitation: {},
        surface_totale: {},
        categorie: {},
        articles: [categorie]
      }
    }
    ;(body.titres[categorie].commune_principale_exploitation ??= {})[annee] =
      fakeCommune
    ;(body.titres[categorie].surface_totale ??= {})[annee] = 1
    body.titres[categorie].categorie[annee] = categorie
  })
  const fiscaliteResult = await apiOpenfiscaCalculate(body)

  const substances: FiscaliteParSubstanceParAnnee = {
    aloh: {},
    naca: {},
    nacb: {},
    nacc: {}
  }
  annees.filter(onlyUnique).forEach(annee => {
    const anneeFiscale = anneeSuivante(annee)
    const anneeFiscaleNumber = Number(anneeFiscale)
    substancesFiscalesStats.forEach(substance => {
      const substanceFiscale = SubstancesFiscale[substance]

      const pme =
        (fiscaliteResult.articles.pme?.[
          redevanceDepartementale(substanceFiscale)
        ]?.[anneeFiscaleNumber] ?? 0) +
        (fiscaliteResult.articles.pme?.[redevanceCommunale(substanceFiscale)]?.[
          anneeFiscaleNumber
        ] ?? 0)

      const autre =
        (fiscaliteResult.articles.autre?.[
          redevanceDepartementale(substanceFiscale)
        ]?.[anneeFiscaleNumber] ?? 0) +
        (fiscaliteResult.articles.autre?.[
          redevanceCommunale(substanceFiscale)
        ]?.[anneeFiscaleNumber] ?? 0)

      const sum = pme + autre
      if (substance in substances) {
        substances[substance][anneeFiscale] = Number(sum.toFixed(0))
      }
    })
  })

  return substances
}
