import { FunctionalComponent , Ref, ref, computed, onMounted, defineComponent } from 'vue'
import { fetchWithJson , AsyncData } from '@/api/client-rest'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import {
  StatistiquesGuyane,
  StatistiquesGuyaneActivite,
  StatistiquesGuyaneData
} from 'camino-common/src/statistiques'
import GuyaneActivite from './guyane-activite.vue'
import BarChart from '../_charts/configurable-chart.vue'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { numberFormat } from '@/utils/number-format'


import { CHART_COLORS } from '../_charts/utils'
import { ChartConfiguration, ChartData } from 'chart.js'
import {
  anneePrecedente,
  anneeSuivante,
  CaminoAnnee,
  CaminoDate,
  getAnnee,
  getCurrent,
  isAnnee,
  toCaminoDate
} from 'camino-common/src/date'

const getStats = async (): Promise<StatistiquesGuyane> => {
  const data: StatistiquesGuyaneData = await fetchWithJson(
    CaminoRestRoutes.statistiquesGuyane,
    {}
  )
  return {
    data,
    parAnnee: data.annees.reduce(
      (
        acc: Record<CaminoAnnee, StatistiquesGuyaneActivite>,
        statsAnnee: StatistiquesGuyaneActivite
      ) => {
        acc[statsAnnee.annee] = statsAnnee

        return acc
      },
      {}
    )
  }
}

export const Guyane: FunctionalComponent = () => (
  <PureGuyane getStats={getStats} />
)

const defaultConfiguration = (data: ChartData): ChartConfiguration => ({
  type: 'bar',
  data,
  options: {
    plugins: {
      legend: {
        // TODO 2022-11-02 trouver un moyen de prendre plus de place
        display: true,
        position: 'top',
        fullSize: true
      }
    },
    locale: 'fr-FR',
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      demandes: {
        type: 'linear',
        position: 'left',
        ticks: { stepSize: 1 }
      },
      surface: {
        type: 'linear',
        position: 'right'
      }
    }
  }
})

const armChartConfiguration = (
  data: StatistiquesGuyaneData
): ChartConfiguration => {
  const annees: CaminoAnnee[] = [...Object.keys(data.arm.depot)].filter(isAnnee)
  const chartData: ChartData = {
    labels: annees,
    datasets: [
      {
        type: 'bar',
        label: "Demandes d'octroi ARM déposées",
        yAxisID: 'demandes',
        data: annees.map(annee => data.arm.depot[annee]),
        backgroundColor: CHART_COLORS.green
      },
      {
        type: 'bar',
        label: "Demandes d'ARM octroyées",
        yAxisID: 'demandes',
        data: annees.map(annee => data.arm.octroiEtProlongation[annee]),
        backgroundColor: CHART_COLORS.blue
      },
      {
        type: 'bar',
        label: "Demandes d'octroi d'ARM refusées",
        yAxisID: 'demandes',
        data: annees.map(annee => data.arm.refusees[annee]),
        backgroundColor: CHART_COLORS.purple
      },
      {
        type: 'line',
        label: 'Surface cumulée des autorisations de recherche (ha)',
        yAxisID: 'surface',
        data: annees.map(annee => data.arm.surface[annee]),
        backgroundColor: CHART_COLORS.blue
      }
    ]
  }

  return defaultConfiguration(chartData)
}

const prmChartConfiguration = (
  data: StatistiquesGuyaneData
): ChartConfiguration => {
  const annees: CaminoAnnee[] = [...Object.keys(data.prm.depot)].filter(isAnnee)
  const chartData: ChartData = {
    labels: annees,
    datasets: [
      {
        type: 'bar',
        label: 'Demandes de PER déposées (octroi et prolongation)',
        yAxisID: 'demandes',
        data: annees.map(annee => data.prm.depot[annee]),
        backgroundColor: CHART_COLORS.green
      },
      {
        type: 'bar',
        label: 'Demandes de PER octroyées et prolongées',
        yAxisID: 'demandes',
        data: annees.map(annee => data.prm.octroiEtProlongation[annee]),
        backgroundColor: CHART_COLORS.blue
      },
      {
        type: 'bar',
        label: 'Demandes de PER refusées (octroi et prolongation)',
        yAxisID: 'demandes',
        data: annees.map(annee => data.prm.refusees[annee]),
        backgroundColor: CHART_COLORS.purple
      },
      {
        type: 'line',
        label: 'Surface cumulée des permis de recherche (ha) accordés',
        yAxisID: 'surface',
        data: annees.map(annee => data.prm.surface[annee]),
        backgroundColor: CHART_COLORS.blue
      }
    ]
  }

  return defaultConfiguration(chartData)
}

const axmChartConfiguration = (
  data: StatistiquesGuyaneData
): ChartConfiguration => {
  const annees: CaminoAnnee[] = [...Object.keys(data.axm.depot)].filter(isAnnee)
  const chartData: ChartData = {
    labels: annees,
    datasets: [
      {
        type: 'bar',
        label: "Demandes d'AEX déposées (octroi et prolongation)",
        yAxisID: 'demandes',
        data: annees.map(annee => data.axm.depot[annee]),
        backgroundColor: CHART_COLORS.green
      },
      {
        type: 'bar',
        label: "Demandes d'AEX octroyées et prolongées",
        yAxisID: 'demandes',
        data: annees.map(annee => data.axm.octroiEtProlongation[annee]),
        backgroundColor: CHART_COLORS.blue
      },
      {
        type: 'bar',
        label: "Demandes d'AEX refusées (octroi et prolongation)",
        yAxisID: 'demandes',
        data: annees.map(annee => data.axm.refusees[annee]),
        backgroundColor: CHART_COLORS.purple
      },
      {
        type: 'line',
        label: "Surface cumulée des autorisations d'exploitation (ha) accordés",
        yAxisID: 'surface',
        data: annees.map(annee => data.axm.surface[annee]),
        backgroundColor: CHART_COLORS.blue
      }
    ]
  }
  return defaultConfiguration(chartData)
}

const cxmChartConfiguration = (
  data: StatistiquesGuyaneData
): ChartConfiguration => {
  const annees: CaminoAnnee[] = [...Object.keys(data.cxm.depot)].filter(isAnnee)
  const chartData: ChartData = {
    labels: annees,
    datasets: [
      {
        type: 'bar',
        label: 'Demandes de concessions déposées (octroi et prolongation)',
        yAxisID: 'demandes',
        data: annees.map(annee => data.cxm.depot[annee]),
        backgroundColor: CHART_COLORS.green
      },
      {
        type: 'bar',
        label: 'Demandes de concessions octroyées et prolongées',
        yAxisID: 'demandes',
        data: annees.map(annee => data.cxm.octroiEtProlongation[annee]),
        backgroundColor: CHART_COLORS.blue
      },
      {
        type: 'bar',
        label: 'Demandes de concessions refusées (octroi et prolongation)',
        yAxisID: 'demandes',
        data: annees.map(annee => data.cxm.refusees[annee]),
        backgroundColor: CHART_COLORS.purple
      },
      {
        type: 'line',
        label: 'Surface cumulée des concessions (ha) accordés',
        yAxisID: 'surface',
        data: annees.map(annee => data.cxm.surface[annee]),
        backgroundColor: CHART_COLORS.blue
      }
    ]
  }

  return defaultConfiguration(chartData)
}

export interface Props {
  getStats: () => Promise<StatistiquesGuyane>
  currentDate?: CaminoDate
}
export const PureGuyane = defineComponent<Props>({
  props: ['getStats', 'currentDate'] as unknown as undefined,
  setup(props: Props) {
    const currentDate = props.currentDate ?? getCurrent()
    const data = ref<AsyncData<StatistiquesGuyane>>({
      status: 'LOADING'
    })

    const tabs = computed<CaminoAnnee[]>(() => {
      let annee = getAnnee(currentDate)
      return [0, 1, 2, 3, 4]
        .map(_id => {
          const monAnnee = annee
          annee = anneePrecedente(annee)
          return monAnnee
        })
        .reverse()
    })

    const tabToggle = (tabId: CaminoAnnee) => {
      tabActive.value = tabId
    }

    const enConstruction = (annee: CaminoAnnee): boolean => {
      // À partir du 01/09 de chaque année cacher le bandeau sur l’année d’avant.
      // Le 1er septembre 2023 on enlève le bandeau sur l’année 2022
      return currentDate < toCaminoDate(`${anneeSuivante(annee)}-09-01`)
    }
    const tabActive: Ref<CaminoAnnee> = ref(getAnnee(currentDate))

    const anneeLaPlusRecenteConsolidee = tabs.value
      .slice()
      .reverse()
      .find(annee => !enConstruction(annee))
    if (anneeLaPlusRecenteConsolidee) {
      tabActive.value = anneeLaPlusRecenteConsolidee
    }

    onMounted(async () => {
      try {
        const stats = await props.getStats()
        data.value = {
          status: 'LOADED',
          value: stats
        }
      } catch (ex: any) {
        data.value = {
          status: 'ERROR',
          message: ex.message ?? 'something wrong happened'
        }
        console.error(ex)
      }
    })

    return () => (
      <div class="content">
        <div id="etat" class="mb-xxl mt">
          <h2>État du domaine minier en temps réel</h2>
          <span class="separator" />
          <p>
            Les données affichées ici sont celles contenues dans la base de
            donnée Camino. Elles sont susceptibles d’évoluer chaque jour au grès
            des décisions et de la fin de validité des titres et autorisations.
            Ces données concernent exclusivement le territoire guyanais.
          </p>
          <p>
            Les surfaces cumulées concernées par un titre ou une autorisation
            d’exploration et ou d’exploitation n’impliquent pas qu’elles sont
            effectivement explorées ou exploitées sur tout ou partie de l'année.
            Les travaux miniers font l’objet de déclarations ou d’autorisations
            distinctes portant sur une partie seulement de la surface des titres
            miniers.
          </p>
          <div class="mb-xxl">
            <h3>Autorisations et titres d’exploration</h3>
            <hr />
            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <p class="h0 text-center">
                  <LoadingElement
                    data={data.value}
                    renderItem={item => <>{item.data.titresArm}</>}
                  />
                </p>
                <p class="bold text-center">Autorisations de recherche</p>
                <p class="h6 text-center">
                  <router-link
                    to={{
                      name: 'titres',
                      query: {
                        domainesIds: 'm',
                        typesIds: 'ar',
                        statutsIds: 'val,mod',
                        territoires: 'guyane',
                        vueId: 'table'
                      }
                    }}
                  >
                    Voir les titres
                  </router-link>
                </p>
              </div>
              <div class="tablet-blob-1-4">
                <p class="h0 text-center">
                  <LoadingElement
                    data={data.value}
                    renderItem={item => <>{item.data.titresPrm}</>}
                  />
                </p>
                <p class="bold text-center">Permis exclusifs de recherches</p>
                <p class="h6 text-center">
                  <router-link
                    to={{
                      name: 'titres',
                      query: {
                        domainesIds: 'm',
                        typesIds: 'pr',
                        statutsIds: 'val,mod',
                        territoires: 'guyane',
                        vueId: 'table'
                      }
                    }}
                  >
                    Voir les titres
                  </router-link>
                </p>
              </div>
              <div class="tablet-blob-1-2">
                <p class="h0 text-center">
                  <LoadingElement
                    data={data.value}
                    renderItem={item => (
                      <>{numberFormat(item.data.surfaceExploration)} ha</>
                    )}
                  />
                </p>
                <p class="bold text-center">
                  Surfaces cumulées des titres pouvant faire l'objet d'une
                  activité d’exploration
                </p>
              </div>
            </div>
          </div>
          <div class="mb-xxl">
            <h3>Autorisations et titres d’exploitation</h3>
            <hr />
            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <p class="h0 text-center">
                  <LoadingElement
                    data={data.value}
                    renderItem={item => <>{item.data.titresAxm}</>}
                  />
                </p>
                <p class="bold text-center">Autorisations d'exploitation</p>
                <p class="h6 text-center">
                  <router-link
                    to={{
                      name: 'titres',
                      query: {
                        domainesIds: 'm',
                        typesIds: 'ax',
                        statutsIds: 'val,mod',
                        territoires: 'guyane',
                        vueId: 'table'
                      }
                    }}
                  >
                    Voir les titres
                  </router-link>
                </p>
              </div>
              <div class="tablet-blob-1-4">
                <p class="h0 text-center">
                  <LoadingElement
                    data={data.value}
                    renderItem={item => <>{item.data.titresCxm}</>}
                  />
                </p>
                <p class="bold text-center">Concessions</p>
                <p class="h6 text-center">
                  <router-link
                    to={{
                      name: 'titres',
                      query: {
                        domainesIds: 'm',
                        typesIds: 'cx',
                        statutsIds: 'val,mod',
                        territoires: 'guyane',
                        vueId: 'table'
                      }
                    }}
                  >
                    Voir les titres
                  </router-link>
                </p>
              </div>
              <div class="tablet-blob-1-4">
                <p class="h0 text-center">
                  <LoadingElement
                    data={data.value}
                    renderItem={item => (
                      <>{numberFormat(item.data.surfaceExploitation)} ha</>
                    )}
                  />
                </p>
                <p class="bold text-center">
                  Surfaces cumulées des titres pouvant faire l'objet d'une
                  activité d’exploitation
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2>Production et activité minière légales</h2>
        <span class="separator" />
        <p class="mb-xl">
          Les données affichées ici sont celles contenues dans la base de donnée
          Camino. Elles sont stabilisées pour l’année n-2 mais sont susceptibles
          d’évoluer jusqu’à la cloture de la collecte des déclarations
          règlementaires de l’année précédente et l'année en cours. Ces données
          concernent exclusivement le territoire guyanais.
        </p>

        <div class="flex">
          {tabs.value.map(tab => (
            <div
              key={tab}
              class={`${tabActive.value === tab ? 'active' : ''} mr-xs`}
            >
              <div class="p-m btn-tab rnd-t-s" onClick={() => tabToggle(tab)}>
                {tab}
              </div>
            </div>
          ))}
        </div>

        <div class="line-neutral width-full mb" />
        <LoadingElement
          data={data.value}
          renderItem={item => (
            <GuyaneActivite
              statistiqueGuyane={item.parAnnee[tabActive.value]}
              enConstruction={enConstruction(tabActive.value)}
              class="mb-xxl"
            />
          )}
        />

        <div class="line-neutral width-full mb-xl" />
        <div id="evolution" class="mb-xxl">
          <h2>Activité</h2>
          <span class="separator" />
          <p>
            Les données affichées ici sont celles contenues dans la base de
            donnée Camino. Les données antérieures à 2018 reprises d’anciens
            systèmes peuvent ne pas être exhautives. Ces données concernent
            exclusivement le territoire guyanais.
          </p>
          <div class="mb-xl">
            <h3>Autorisations de recherche</h3>
            <hr />
            <LoadingElement
              data={data.value}
              renderItem={item => (
                <BarChart
                  chartConfiguration={armChartConfiguration(item.data)}
                />
              )}
            />
          </div>
          <div class="mb-xl">
            <h3>Permis de recherches</h3>
            <hr />
            <LoadingElement
              data={data.value}
              renderItem={item => (
                <BarChart
                  chartConfiguration={prmChartConfiguration(item.data)}
                />
              )}
            />
          </div>
          <div class="mb-xl">
            <h3>Autorisations d'exploitation</h3>
            <hr />
            <LoadingElement
              data={data.value}
              renderItem={item => (
                <BarChart
                  chartConfiguration={axmChartConfiguration(item.data)}
                />
              )}
            />
          </div>
          <div class="mb-xl">
            <h3>Concessions</h3>
            <hr />
            <LoadingElement
              data={data.value}
              renderItem={item => (
                <BarChart
                  chartConfiguration={cxmChartConfiguration(item.data)}
                />
              )}
            />
          </div>
        </div>
      </div>
    )
  }
})
