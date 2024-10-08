import { getWithJson, AsyncData } from '@/api/client-rest'
import { StatistiquesMinerauxMetauxMetropole } from 'camino-common/src/statistiques'
import { ChartWithExport } from '../_charts/chart-with-export'

import { LoadingElement } from '@/components/_ui/functional-loader'
import { CaminoAnnee, anneeSuivante, isAnnee } from 'camino-common/src/date'
import { ref, onMounted, FunctionalComponent, defineComponent } from 'vue'
import { ChartConfiguration, ChartData, ChartDataset } from 'chart.js'
import { SubstancesFiscale, SUBSTANCES_FISCALES_IDS } from 'camino-common/src/static/substancesFiscales'
import { Unites } from 'camino-common/src/static/unites'
import { onlyUnique } from 'camino-common/src/typescript-tools'
import { RegionId, isRegionId, Regions } from 'camino-common/src/static/region'
import { CHART_COLORS, nextColor } from '../_charts/utils'
import styles from './mineraux-metaux-metropole.module.css'
import { numberFormat } from 'camino-common/src/number'
import statsStyles from './statistiques.module.css'

const getStats = async (): Promise<StatistiquesMinerauxMetauxMetropole> => getWithJson('/rest/statistiques/minerauxMetauxMetropole', {})

export const MinerauxMetauxMetropole: FunctionalComponent = () => <PureMinerauxMetauxMetropole getStats={getStats} />
const bauxiteChartConfiguration = (data: StatistiquesMinerauxMetauxMetropole): ChartConfiguration => {
  const annees: CaminoAnnee[] = Object.keys(data.substances.aloh).filter(isAnnee)
  annees.push(anneeSuivante(annees[annees.length - 1]))
  const chartData: ChartData = {
    labels: annees,
    datasets: [
      {
        type: 'line',
        yAxisID: 'fiscalite',
        label: 'Fiscalité',
        backgroundColor: CHART_COLORS.blue,
        borderColor: CHART_COLORS.blue,
        borderDash: [5, 5],
        data: annees.map(annee => data.fiscaliteParSubstanceParAnnee[SUBSTANCES_FISCALES_IDS.bauxite]?.[annee] ?? Number.NaN),
      },
      {
        type: 'bar',
        yAxisID: 'production',
        label: 'Production',
        data: annees.map(annee => data.substances.aloh[annee] ?? 0),
        backgroundColor: 'rgb(118, 182, 189)',
      },
    ],
  }

  return {
    type: 'bar',
    data: chartData,
    options: {
      locale: 'fr-FR',
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          fullSize: true,
        },
        title: {
          display: true,
          text: `Production de Bauxite et fiscalité`,
          font: {
            size: 16,
          },
        },
      },
      scales: {
        production: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: `Production Bauxite (${Unites[SubstancesFiscale.naca.uniteId].nom})` },
        },
        fiscalite: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: `Fiscalité (en €)`,
          },
        },
      },
    },
  }
}

const selsChartConfiguration = (data: StatistiquesMinerauxMetauxMetropole): ChartConfiguration => {
  const annees: CaminoAnnee[] = [...Object.keys(data.substances.naca), ...Object.keys(data.substances.nacb), ...Object.keys(data.substances.nacc)].filter(isAnnee).filter(onlyUnique)

  annees.push(anneeSuivante(annees[annees.length - 1]))

  const regionsIds: RegionId[] = annees
    .flatMap(annee => [...Object.keys(data.substances?.naca[annee] ?? {}), ...Object.keys(data.substances?.nacb[annee] ?? {}), ...Object.keys(data.substances?.nacc[annee] ?? {})])
    .filter(isRegionId)
    .filter(onlyUnique)

  const datasetByRegion: ChartDataset[] = regionsIds.map((regionId, index) => {
    const label = Regions[regionId].nom
    const sum = (annee: CaminoAnnee) => (data.substances.naca[annee]?.[regionId] ?? 0) + (data.substances.nacb[annee]?.[regionId] ?? 0) + (data.substances.nacc[annee]?.[regionId] ?? 0)

    return {
      type: 'bar',
      label: label[0].toUpperCase() + label.substring(1),
      data: annees.map(sum),
      backgroundColor: nextColor(index),
    }
  })
  const chartData: ChartData = {
    labels: annees,
    datasets: [
      ...datasetByRegion,
      {
        type: 'line',
        yAxisID: 'fiscalite',
        label: 'Fiscalité',
        backgroundColor: CHART_COLORS.blue,
        borderColor: CHART_COLORS.blue,
        borderDash: [5, 5],
        data: annees.map(
          annee =>
            (data.fiscaliteParSubstanceParAnnee[SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_]?.[annee] ?? Number.NaN) +
            (data.fiscaliteParSubstanceParAnnee[SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitEnDissolutionParSondage]?.[annee] ?? Number.NaN) +
            (data.fiscaliteParSubstanceParAnnee[SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage]?.[annee] ?? Number.NaN)
        ),
      },
    ],
  }

  return {
    type: 'bar',
    data: chartData,
    options: {
      locale: 'fr-FR',
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Production de Sels et fiscalité`,
          font: {
            size: 16,
          },
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: `Production Sels (${Unites[SubstancesFiscale.naca.uniteId].nom})`,
          },
        },
        fiscalite: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: `Fiscalité (en €)`,
          },
        },
      },
    },
  }
}

const perChartConfiguration = (data: StatistiquesMinerauxMetauxMetropole): ChartConfiguration => {
  const annees: CaminoAnnee[] = [...Object.keys(data.prm.depot)].filter(isAnnee)
  const chartData: ChartData = {
    labels: annees,
    datasets: [
      {
        type: 'bar',
        label: 'Demandes de PER déposées (octroi et prolongation)',
        yAxisID: 'demandes',
        data: annees.map(annee => data.prm.depot[annee] ?? 0),
        backgroundColor: CHART_COLORS.green,
      },
      {
        type: 'bar',
        label: 'Demandes de PER octroyées et prolongées',
        yAxisID: 'demandes',
        data: annees.map(annee => data.prm.octroiEtProlongation[annee] ?? 0),
        backgroundColor: CHART_COLORS.blue,
      },
      {
        type: 'bar',
        label: 'Demandes de PER refusées (octroi et prolongation)',
        yAxisID: 'demandes',
        data: annees.map(annee => data.prm.refusees[annee] ?? 0),
        backgroundColor: CHART_COLORS.purple,
      },
      {
        type: 'line',
        label: 'Surface cumulée des permis de recherche (ha) accordés',
        yAxisID: 'surface',
        data: annees.map(annee => data.prm.surface[annee] ?? 0),
        backgroundColor: CHART_COLORS.blue,
      },
    ],
  }

  return {
    type: 'bar',
    data: chartData,
    options: {
      plugins: {
        legend: {
          // TODO 2022-11-02 trouver un moyen de prendre plus de place
          display: true,
          position: 'top',
          fullSize: true,
        },
      },
      locale: 'fr-FR',
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        demandes: {
          type: 'linear',
          position: 'left',
          ticks: { stepSize: 1 },
        },
        surface: {
          type: 'linear',
          position: 'right',
        },
      },
    },
  }
}

const concessionChartConfiguration = (data: StatistiquesMinerauxMetauxMetropole): ChartConfiguration => {
  const annees: CaminoAnnee[] = [...Object.keys(data.cxm.depot)].filter(isAnnee)
  const chartData: ChartData = {
    labels: annees,
    datasets: [
      {
        type: 'bar',
        label: 'Demandes de concessions déposées (octroi et prolongation)',
        yAxisID: 'demandes',
        data: annees.map(annee => data.cxm.depot[annee] ?? 0),
        backgroundColor: CHART_COLORS.green,
      },
      {
        type: 'bar',
        label: 'Demandes de concessions octroyées et prolongées',
        yAxisID: 'demandes',
        data: annees.map(annee => data.cxm.octroiEtProlongation[annee] ?? 0),
        backgroundColor: CHART_COLORS.blue,
      },
      {
        type: 'bar',
        label: 'Demandes de concessions refusées (octroi et prolongation)',
        yAxisID: 'demandes',
        data: annees.map(annee => data.cxm.refusees[annee] ?? 0),
        backgroundColor: CHART_COLORS.purple,
      },
      {
        type: 'line',
        label: 'Surface cumulée des concessions (ha) accordées',
        yAxisID: 'surface',
        data: annees.map(annee => data.cxm.surface[annee] ?? 0),
        backgroundColor: CHART_COLORS.blue,
      },
    ],
  }

  return {
    type: 'bar',
    data: chartData,
    options: {
      plugins: {
        legend: {
          // TODO 2022-11-02 trouver un moyen de prendre plus de place
          display: true,
          position: 'top',
          fullSize: true,
        },
      },
      locale: 'fr-FR',
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        demandes: {
          type: 'linear',
          position: 'left',
          ticks: { stepSize: 1 },
        },
        surface: {
          type: 'linear',
          position: 'right',
        },
      },
    },
  }
}

interface Props {
  getStats: () => Promise<StatistiquesMinerauxMetauxMetropole>
}

export const PureMinerauxMetauxMetropole = defineComponent<Props>(props => {
  const data = ref<AsyncData<StatistiquesMinerauxMetauxMetropole>>({
    status: 'LOADING',
  })

  onMounted(async () => {
    try {
      const stats = await props.getStats()
      data.value = {
        status: 'LOADED',
        value: stats,
      }
    } catch (e: any) {
      console.error(e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  })

  return () => (
    <div class="content">
      <div id="etat" class="mb-xxl mt">
        <h2>État du domaine minier des substances non énergétiques, dans l’Hexagone, en temps réel</h2>
        <span class="separator" />
        <p>
          Les données affichées ici sont celles contenues dans la base de donnée Camino. Elles sont susceptibles d’évoluer chaque jour au grès des décisions et de la fin de validité des titres et
          autorisations.
        </p>
        <p>
          Les surfaces cumulées concernées par un titre ou une autorisation n’impliquent pas qu’elles sont effectivement explorées ou exploitées sur tout ou partie de l'année. Les travaux miniers font
          l’objet de déclarations ou d’autorisations distinctes portant sur une partie seulement de la surface des titres miniers.
        </p>
        <div class="mb-xxl">
          <h3>Titres d’exploration</h3>
          <hr />
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3">
              <p class={['fr-display--xs', statsStyles['donnee-importante']]}>
                <LoadingElement data={data.value} renderItem={item => <>{item.titres.instructionExploration}</>} />
              </p>
              <div>
                <p class="bold text-center">
                  Demande
                  {data.value.status === 'LOADED' && data.value.value.titres.instructionExploration > 1 ? 's ' : ' '}
                  en cours d'instruction (initiale et modification en instance)
                </p>
              </div>
              <p class="h6 text-center">
                <router-link
                  to={{
                    name: 'titres',
                    query: {
                      domainesIds: 'm',
                      typesIds: 'ar,ap,pr',
                      statutsIds: 'dmi,mod',
                      regions: ['84', '27', '53', '24', '94', '44', '32', '11', '28', '75', '76', '52', '93'],
                      vueId: 'table',
                    },
                  }}
                >
                  Voir les titres
                </router-link>
              </p>
            </div>
            <div class="tablet-blob-1-3">
              <p class={['fr-display--xs', statsStyles['donnee-importante']]}>
                <LoadingElement data={data.value} renderItem={item => <>{item.titres.valPrm}</>} />
              </p>
              <p class="bold text-center">Permis exclusifs de recherches</p>
              <p class="h6 text-center">
                <router-link
                  to={{
                    name: 'titres',
                    query: {
                      domainesIds: 'm',
                      typesIds: 'pr',
                      statutsIds: 'val',
                      regions: ['84', '27', '53', '24', '94', '44', '32', '11', '28', '75', '76', '52', '93'],
                      vueId: 'table',
                    },
                  }}
                >
                  Voir les titres
                </router-link>
              </p>
            </div>
            <div class="tablet-blob-1-3">
              <p class={['fr-display--xs', statsStyles['donnee-importante']]}>
                <LoadingElement data={data.value} renderItem={item => <>{numberFormat(item.surfaceExploration)} ha</>} />
              </p>
              <p class="bold text-center">Surfaces cumulées des titres pouvant faire l'objet d'une activité d’exploration</p>
            </div>
          </div>
        </div>
        <div class="mb-xxl">
          <h3>Titres d’exploitation</h3>
          <hr />
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3">
              <p class={['fr-display--xs', statsStyles['donnee-importante']]}>
                <LoadingElement data={data.value} renderItem={item => <>{numberFormat(item.titres.instructionExploitation)}</>} />
              </p>
              <div>
                <p class="bold text-center">
                  Demande
                  {data.value.status === 'LOADED' && data.value.value.titres.instructionExploitation > 1 ? 's ' : ' '}
                  en cours d'instruction (initiale et modification en instance)
                </p>
              </div>
              <p class="h6 text-center">
                <router-link
                  to={{
                    name: 'titres',
                    query: {
                      domainesIds: 'm',
                      typesIds: 'ax,cx,px',
                      statutsIds: 'dmi,mod',
                      regions: ['84', '27', '53', '24', '94', '44', '32', '11', '28', '75', '76', '52', '93'],
                      vueId: 'table',
                    },
                  }}
                >
                  Voir les titres
                </router-link>
              </p>
            </div>
            <div class="tablet-blob-1-3">
              <p class={['fr-display--xs', statsStyles['donnee-importante']]}>
                <LoadingElement data={data.value} renderItem={item => <>{numberFormat(item.titres.valCxm)}</>} />
              </p>
              <div>
                <p class="bold text-center">
                  Concession
                  {data.value.status === 'LOADED' && data.value.value.titres.valCxm > 1 ? 's' : ''}
                </p>
              </div>
              <p class="h6 text-center">
                <router-link
                  to={{
                    name: 'titres',
                    query: {
                      domainesIds: 'm',
                      typesIds: 'cx',
                      statutsIds: 'val',
                      regions: ['84', '27', '53', '24', '94', '44', '32', '11', '28', '75', '76', '52', '93'],
                      vueId: 'table',
                    },
                  }}
                >
                  Voir les titres
                </router-link>
              </p>
            </div>
            <div class="tablet-blob-1-3">
              <p class={['fr-display--xs', statsStyles['donnee-importante']]}>
                <LoadingElement data={data.value} renderItem={item => <>{numberFormat(item.surfaceExploitation)} ha</>} />
              </p>
              <p class="bold text-center">Surfaces cumulées des titres pouvant faire l'objet d'une activité d’exploitation</p>
            </div>
          </div>
        </div>
      </div>

      <div class="line-neutral width-full mb" />

      <h2>Production annuelle et fiscalité minière des ressources minérales non énergétiques, par famille de substances</h2>
      <span class="separator" />
      <p>Données contenues dans la base de données Camino, stabilisées pour l’année n-1.</p>
      <p>
        La fiscalité minière est calculée à partir des données de production. Il s'agit des sommes dûes et non des recettes effectivement perçues par les finances publiques. Sommes dûes par les
        opérateurs miniers exploitant au titre des redevances départementale et communale des mines, hors frais de gestion
      </p>

      <div class={styles['grid-container']}>
        <div style="grid-column-end: span 2">
          <h3>Bauxite</h3>
          <ChartWithExport data={data.value} getConfiguration={item => bauxiteChartConfiguration(item)} />
        </div>
        <div style="grid-column-end: span 2">
          <h3>Sels (sel de sodium, sel de potassium, sel gemme…)</h3>
          <ChartWithExport data={data.value} getConfiguration={item => selsChartConfiguration(item)} />
        </div>

        <div style="grid-column-end: span 2">
          <h3>Autres substances</h3>
          <hr />
        </div>
        <div style="grid-column-end: span 2">
          Pour les autres substances de mines exploitées dans l’Hexagone, l'agrégation des données n'est pas possible en raison du nombre limité d'exploitant par type de substance.
          <br />
          <br />
          Au titre du secret des informations économiques et financières, les volumes d'exploitation ne sont pas communicables.
        </div>
      </div>
      <div class="line-neutral width-full mb mt" />
      <h2>Evolution du nombre de titre et de leur surface</h2>
      <span class="separator" />
      <p class="mb-xl">Les données affichées ici sont celles contenues dans la base de donnée Camino. Ces données concernent exclusivement le territoire métropolitain.</p>
      <div class="mb-xl">
        <h3>Permis Exclusif de Recherche (PER)</h3>
        <hr />
        <ChartWithExport data={data.value} getConfiguration={item => perChartConfiguration(item)} />
      </div>
      <div class="mb-xl">
        <h3>Concession</h3>
        <hr />
        <ChartWithExport data={data.value} getConfiguration={item => concessionChartConfiguration(item)} />
      </div>
    </div>
  )
})
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureMinerauxMetauxMetropole.props = ['getStats']
