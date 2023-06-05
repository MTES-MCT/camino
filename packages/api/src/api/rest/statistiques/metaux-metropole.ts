import {
  FiscaliteParSubstanceParAnnee,
  StatistiquesMinerauxMetauxMetropole,
  StatistiquesMinerauxMetauxMetropoleSels,
  anneeCountStatistiqueValidator,
  substancesFiscalesStats,
} from 'camino-common/src/statistiques.js'
import { CaminoAnnee, anneeSuivante, toCaminoAnnee } from 'camino-common/src/date.js'
import { fromUniteFiscaleToUnite } from 'camino-common/src/static/unites.js'
import { userSuper } from '../../../database/user-super.js'
import { titresGet } from '../../../database/queries/titres.js'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import { SubstancesFiscale, SUBSTANCES_FISCALES_IDS, SubstanceFiscaleId } from 'camino-common/src/static/substancesFiscales.js'
import { Departements, departementsMetropole, toDepartementId } from 'camino-common/src/static/departement.js'
import { REGION_IDS } from 'camino-common/src/static/region.js'
import { apiOpenfiscaCalculate, OpenfiscaRequest, redevanceCommunale, redevanceDepartementale, substanceFiscaleToInput } from '../../../tools/api-openfisca/index.js'
import { onlyUnique } from 'camino-common/src/typescript-tools.js'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes.js'
import { evolutionTitres } from './evolution-titres.js'
import type { Pool } from 'pg'
import { dbQueryAndValidate } from '../../../pg-database.js'
import {
  getSubstancesByEntrepriseCategoryByAnnee,
  getTitreActiviteSubstanceParAnnee,
  getsubstancesByAnneeByCommune,
  substancesByAnneeByCommuneValidator,
  substancesByEntrepriseCategoryByAnneeValidator,
} from './metaux-metropole.queries.js'

export const getMinerauxMetauxMetropolesStatsInside = async (pool: Pool): Promise<StatistiquesMinerauxMetauxMetropole> => {
  const result = await statistiquesMinerauxMetauxMetropoleInstantBuild()
  const substances = await buildSubstances(pool)
  const fiscaliteParSubstanceParAnnee = await fiscaliteDetail(pool)
  const prmData = await evolutionTitres(pool, TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES, departementsMetropole)
  const cxmData = await evolutionTitres(pool, TITRES_TYPES_TYPES_IDS.CONCESSION, departementsMetropole)

  return {
    ...result,
    ...substances,
    fiscaliteParSubstanceParAnnee,
    prm: prmData,
    cxm: cxmData,
  }
}

const sels = [
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_,
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitEnDissolutionParSondage,
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage,
] as const satisfies readonly SubstanceFiscaleId[]
type Sels = (typeof sels)[number]

type StatistiquesMinerauxMetauxMetropoleInstantBuild = Pick<StatistiquesMinerauxMetauxMetropole, 'surfaceExploration' | 'surfaceExploitation' | 'titres'>
const statistiquesMinerauxMetauxMetropoleInstantBuild = async (): Promise<StatistiquesMinerauxMetauxMetropoleInstantBuild> => {
  const titres = await titresGet(
    {
      domainesIds: ['m'],
      typesIds: ['ar', 'ap', 'pr', 'ax', 'px', 'cx'],
      territoires: 'FR',
    },
    {
      fields: {
        surfaceEtape: { id: {} },
        demarches: {
          etapes: { id: {} },
          type: { id: {} },
        },
        pointsEtape: { id: {} },
      },
    },
    userSuper
  )
  const statsInstant: StatistiquesMinerauxMetauxMetropoleInstantBuild = titres.reduce(
    (acc, titre) => {
      if (titre.titreStatutId && ['val', 'mod', 'dmi'].includes(titre.titreStatutId)) {
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
        valCxm: 0,
      },
    }
  )

  statsInstant.surfaceExploration = Math.floor(statsInstant.surfaceExploration * 100) // conversion 1 km² = 100 ha
  statsInstant.surfaceExploitation = Math.floor(statsInstant.surfaceExploitation * 100) // conversion 1 km² = 100 ha

  return statsInstant
}

const buildSubstances = async (pool: Pool): Promise<Pick<StatistiquesMinerauxMetauxMetropole, 'substances'>> => {
  const bauxite = SUBSTANCES_FISCALES_IDS.bauxite
  const resultSubstances = await dbQueryAndValidate(getTitreActiviteSubstanceParAnnee, { substanceFiscale: bauxite }, pool, anneeCountStatistiqueValidator)

  const bauxiteResult = resultSubstances.reduce<Record<CaminoAnnee, number>>((acc, dateSubstance) => {
    const annee = dateSubstance.annee
    if (!acc[annee]) {
      acc[annee] = 0
    }
    acc[annee] += fromUniteFiscaleToUnite(SubstancesFiscale[bauxite].uniteId, dateSubstance.count)

    return acc
  }, {})
  // 2022-09-30 Valeurs fournies par Laure dans mattermost : https://mattermost.incubateur.net/camino/pl/3n4y958n6idwbrr4me5rkma1oy
  bauxiteResult[toCaminoAnnee('2009')] = 178.7
  bauxiteResult[toCaminoAnnee('2010')] = 132.302
  bauxiteResult[toCaminoAnnee('2011')] = 117.7
  bauxiteResult[toCaminoAnnee('2012')] = 65.336
  bauxiteResult[toCaminoAnnee('2013')] = 109.602
  bauxiteResult[toCaminoAnnee('2014')] = 71.07
  bauxiteResult[toCaminoAnnee('2015')] = 80.578
  bauxiteResult[toCaminoAnnee('2016')] = 112.445
  bauxiteResult[toCaminoAnnee('2017')] = 131.012
  bauxiteResult[toCaminoAnnee('2018')] = 138.8
  bauxiteResult[toCaminoAnnee('2019')] = 120.76

  const resultSel = await dbQueryAndValidate(getsubstancesByAnneeByCommune, { substancesFiscales: sels }, pool, substancesByAnneeByCommuneValidator)
  const selsStats = resultSel.reduce<{
    [key in Sels]: StatistiquesMinerauxMetauxMetropoleSels
  }>(
    (acc, stat) => {
      const annee = stat.annee

      const regions = stat.communes.map(({ id }) => Departements[toDepartementId(id)].regionId).filter(onlyUnique)
      if (regions.length !== 1) {
        console.error('plusieurs régions associées à une activité')
      }
      const regionId = regions[0]

      for (const substance of sels) {
        if (!acc[substance][annee]) {
          acc[substance][annee] = {}
        }
        const substanceData = acc[substance][annee]
        const valeur = fromUniteFiscaleToUnite(SubstancesFiscale[substance].uniteId, stat.substances[substance] ?? 0)
        if (substanceData) {
          substanceData[regionId] = valeur + (substanceData[regionId] ?? 0)
        }
      }

      return acc
    },
    {
      [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_]: {},
      [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitEnDissolutionParSondage]: {},
      [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage]: {},
    }
  )

  // Valeurs fournies par Laure : https://trello.com/c/d6YDa4Ao/341-cas-france-relance-dashboard-grand-public-compl%C3%A8te-les-statistiques-v3-sel
  selsStats.naca[toCaminoAnnee(2009)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 635.592,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 7.684,
    [REGION_IDS['Grand Est']]: 2692.7,
    [REGION_IDS['Nouvelle-Aquitaine']]: 48.724,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 274.732,
    [REGION_IDS.Occitanie]: 867.001,
  }
  selsStats.naca[toCaminoAnnee(2010)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 579.385,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 11.645,
    [REGION_IDS['Grand Est']]: 2995.599,
    [REGION_IDS['Nouvelle-Aquitaine']]: 37.23,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 500.564,
    [REGION_IDS.Occitanie]: 990.091,
  }
  selsStats.naca[toCaminoAnnee(2011)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 959.442,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2959.7,
    [REGION_IDS['Nouvelle-Aquitaine']]: 32.425,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 421.48,
    [REGION_IDS.Occitanie]: 958.849,
  }
  selsStats.naca[toCaminoAnnee(2012)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 936.78,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2426.62,
    [REGION_IDS['Nouvelle-Aquitaine']]: 35.97,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 1042.67,
    [REGION_IDS.Occitanie]: 797.099,
  }
  selsStats.naca[toCaminoAnnee(2013)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 907.994,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2703.049,
    [REGION_IDS['Nouvelle-Aquitaine']]: 37.79,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 1300.854,
    [REGION_IDS.Occitanie]: 1010.892,
  }
  selsStats.naca[toCaminoAnnee(2014)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 763.55,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 1552.197,
    [REGION_IDS['Nouvelle-Aquitaine']]: 34.285,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 843.83,
    [REGION_IDS.Occitanie]: 1062.216,
  }
  selsStats.naca[toCaminoAnnee(2015)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 799.949,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2444.74,
    [REGION_IDS['Nouvelle-Aquitaine']]: 37.303,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 135.02,
    [REGION_IDS.Occitanie]: 1007.542,
  }
  selsStats.naca[toCaminoAnnee(2016)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 830.577,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2377.175,
    [REGION_IDS['Nouvelle-Aquitaine']]: 35.841,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 95.859,
    [REGION_IDS.Occitanie]: 926.388,
  }
  selsStats.naca[toCaminoAnnee(2017)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 869.676,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2585.934,
    [REGION_IDS['Nouvelle-Aquitaine']]: 34.219,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 91.718,
    [REGION_IDS.Occitanie]: 1082.021,
  }
  selsStats.naca[toCaminoAnnee(2018)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 870.718,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2481.271,
    [REGION_IDS['Nouvelle-Aquitaine']]: 31.71,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 150.524,
    [REGION_IDS.Occitanie]: 997.862,
  }
  selsStats.naca[toCaminoAnnee(2019)] = {
    [REGION_IDS['Auvergne-Rhône-Alpes']]: 792.394,
    [REGION_IDS['Bourgogne-Franche-Comté']]: 0,
    [REGION_IDS['Grand Est']]: 2537.412,
    [REGION_IDS['Nouvelle-Aquitaine']]: 36.357,
    [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: 196.828,
    [REGION_IDS.Occitanie]: 997.862,
  }

  return { substances: { aloh: bauxiteResult, ...selsStats } }
}

const fiscaliteDetail = async (pool: Pool): Promise<FiscaliteParSubstanceParAnnee> => {
  const fakeCommune = '66666'
  const body: OpenfiscaRequest = {
    articles: {
      pme: {
        surface_communale: {},
      },
      autre: {
        surface_communale: {},
      },
    },
    titres: {
      pme: {
        commune_principale_exploitation: {},
        surface_totale: {},
        categorie: {},
        articles: ['pme'],
      },
      autre: {
        commune_principale_exploitation: {},
        surface_totale: {},
        categorie: {},
        articles: ['autre'],
      },
    },
    communes: {
      [fakeCommune]: {
        articles: ['pme', 'autre'],
      },
    },
  }

  const result = await dbQueryAndValidate(
    getSubstancesByEntrepriseCategoryByAnnee,
    {
      bauxite: SUBSTANCES_FISCALES_IDS.bauxite,
      selContenu: SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_,
      selSondage: SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitEnDissolutionParSondage,
      selAbattage: SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage,
    },
    pool,
    substancesByEntrepriseCategoryByAnneeValidator
  )

  const annees: CaminoAnnee[] = []

  result.forEach(row => {
    const annee = row.annee
    const categorie = row.categorie

    annees.push(annee)
    const anneeFiscale = anneeSuivante(annee)
    body.articles[categorie].surface_communale[annee] = 1

    substancesFiscalesStats.forEach(substance => {
      const substanceFiscale = SubstancesFiscale[substance]
      ;(body.articles[categorie][redevanceCommunale(substanceFiscale)] ??= {})[anneeFiscale] = null
      ;(body.articles[categorie][redevanceDepartementale(substanceFiscale)] ??= {})[anneeFiscale] = null
      ;(body.articles[categorie][substanceFiscaleToInput(substanceFiscale)] ??= {})[annee] = fromUniteFiscaleToUnite(substanceFiscale.uniteId, row[substance])
    })

    if (!body.titres[categorie]) {
      body.titres[categorie] = {
        commune_principale_exploitation: {},
        surface_totale: {},
        categorie: {},
        articles: [categorie],
      }
    }
    ;(body.titres[categorie].commune_principale_exploitation ??= {})[annee] = fakeCommune
    ;(body.titres[categorie].surface_totale ??= {})[annee] = 1
    body.titres[categorie].categorie[annee] = categorie
  })
  const fiscaliteResult = await apiOpenfiscaCalculate(body)

  const substances: FiscaliteParSubstanceParAnnee = {
    aloh: {},
    naca: {},
    nacb: {},
    nacc: {},
  }
  annees.filter(onlyUnique).forEach(annee => {
    const anneeFiscale = anneeSuivante(annee)
    const anneeFiscaleNumber = Number(anneeFiscale)
    substancesFiscalesStats.forEach(substance => {
      const substanceFiscale = SubstancesFiscale[substance]

      const pme =
        (fiscaliteResult.articles.pme?.[redevanceDepartementale(substanceFiscale)]?.[anneeFiscaleNumber] ?? 0) +
        (fiscaliteResult.articles.pme?.[redevanceCommunale(substanceFiscale)]?.[anneeFiscaleNumber] ?? 0)

      const autre =
        (fiscaliteResult.articles.autre?.[redevanceDepartementale(substanceFiscale)]?.[anneeFiscaleNumber] ?? 0) +
        (fiscaliteResult.articles.autre?.[redevanceCommunale(substanceFiscale)]?.[anneeFiscaleNumber] ?? 0)

      const sum = pme + autre
      if (substance in substances) {
        const subtanceData = substances[substance]
        if (subtanceData) {
          subtanceData[anneeFiscale] = Number(sum.toFixed(0))
        }
      }
    })
  })

  return substances
}
