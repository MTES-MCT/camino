import { defineComponent, onMounted, ref } from 'vue'
import { GranulatsMarinsActivite } from './granulats-marins-activite'
import { ConfigurableChart } from '../_charts/configurable-chart'
import { numberFormat } from '@/utils/number-format'
import { isEventWithTarget } from '@/utils/vue-tsx-utils'
import {
  StatistiqueGranulatsMarinsStatAnnee,
  StatistiquesGranulatsMarins
} from 'camino-common/src/statistiques.js'
import { AsyncData, fetchWithJson } from '@/api/client-rest'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { LoadingElement } from '../_ui/functional-loader'
import {
  CaminoDate,
  getAnnee,
  getCurrent,
  toCaminoDate
} from 'camino-common/src/date'
import type { ChartConfiguration } from 'chart.js'

const ids = [
  'titresPrw',
  'titresPxw',
  'titresCxw',
  'concessionsValides'
] as const

const suggestedMaxCalc = (annees: StatistiqueGranulatsMarinsStatAnnee[]) =>
  Math.max(
    ...annees.reduce<number[]>((acc, annee) => {
      acc.push(...ids.map(id => annee[id].quantite))

      return acc
    }, [])
  )

const statsBarFormat = ({
  annees,
  id,
  bar,
  line,
  labelBar,
  labelLine
}: {
  annees: StatistiqueGranulatsMarinsStatAnnee[]
  id?: typeof ids[number]
  bar: 'volume' | 'quantite'
  line: 'masse' | 'surface'
  labelBar: string
  labelLine: string
}): ChartConfiguration<'bar' | 'line'>['data'] =>
  annees.reduce<{
    labels: number[]
    datasets: {
      type: 'line' | 'bar'
      label: string
      yAxisID: 'line' | 'bar'
      fill?: 'start'
      tension?: number
      backgroundColor: string
      borderColor?: string
      data: number[]
    }[]
  }>(
    (acc, stats) => {
      acc.labels.push(stats.annee)
      const dataLine: number =
        line === 'surface'
          ? stats[id ?? 'concessionsValides'][line]
          : stats[line]
      const dataBar: number =
        bar === 'quantite' ? stats[id ?? 'concessionsValides'][bar] : stats[bar]
      acc.datasets[0].data.push(dataLine)
      acc.datasets[1].data.push(dataBar)

      return acc
    },
    {
      labels: [],
      datasets: [
        {
          type: 'line',
          label: labelLine,
          data: [],
          yAxisID: 'line',
          fill: 'start',
          tension: 0.5,
          backgroundColor: 'rgba(55, 111, 170, 0.2)',
          borderColor: 'rgb(55, 111, 170)'
        },
        {
          type: 'bar',
          label: labelBar,
          yAxisID: 'bar',
          data: [],
          backgroundColor: 'rgb(118, 182, 189)'
        }
      ]
    }
  )

const getStats = async (): Promise<StatistiquesGranulatsMarins> => {
  const data: StatistiquesGranulatsMarins = await fetchWithJson(
    CaminoRestRoutes.statistiquesGranulatsMarins,
    {}
  )
  return data
}

const barChartConfig = (
  data: ChartConfiguration<'bar' | 'line'>['data'],
  suggestedMax: number
): ChartConfiguration<'bar' | 'line'> => ({
  type: 'bar',
  data,
  options: {
    locale: 'fr-FR',
    aspectRatio: 2,
    responsive: true,
    scales: {
      bar: { min: 0, suggestedMax },
      line: { min: 0, position: 'right' }
    },
    plugins: {
      legend: {
        reverse: true
      }
    }
  }
})

export const GranulatsMarins = defineComponent({
  setup() {
    return () => <PureGranulatsMarins getStatistiques={getStats} />
  }
})

interface Props {
  currentDate?: CaminoDate
  getStatistiques: () => Promise<StatistiquesGranulatsMarins>
}
export const PureGranulatsMarins = defineComponent<Props>({
  props: ['currentDate', 'getStatistiques'] as unknown as undefined,
  setup(props) {
    const statistiquesGranulatsMarins = ref<
      AsyncData<{
        raw: StatistiquesGranulatsMarins
        statistiques: Record<number, StatistiqueGranulatsMarinsStatAnnee>
        statsAnneesAfter2010: StatistiqueGranulatsMarinsStatAnnee[]
      }>
    >({ status: 'LOADING' })
    const anneeActive = ref(0)
    const currentDate = props.currentDate ? props.currentDate : getCurrent()
    const anneeCurrent = Number(getAnnee(currentDate))

    const anneeSelect = (event: Event) => {
      if (isEventWithTarget(event)) {
        anneeActive.value = Number(event.target.value)
      }
    }
    const suggestedMaxTitres = (
      titreType: typeof ids[number],
      annees: StatistiqueGranulatsMarinsStatAnnee[]
    ) => {
      // si le nombre maximum de titres est inférieur à 10
      if (
        titreType &&
        ids.includes(titreType) &&
        Math.max(...annees.map(annee => annee[titreType].quantite)) <= 10
      ) {
        return 10
      }

      return suggestedMaxCalc(annees)
    }

    onMounted(async () => {
      anneeActive.value = anneeCurrent - 2
      try {
        const data = await props.getStatistiques()

        const statistiques = data.annees.reduce<Record<string, any>>(
          (acc, statsAnnee) => {
            acc[statsAnnee.annee] = statsAnnee
            return acc
          },
          {}
        )

        const statsAnneesAfter2010 = data.annees.filter(
          annee => annee.annee >= 2010 && annee.annee < anneeCurrent
        )

        // affichage des données de l'année n-2 à partir du 1er avril de l'année en cours
        const toggleDate = toCaminoDate(`${anneeCurrent}-04-01`)
        const beforeToggleDate = currentDate < toggleDate

        statistiquesGranulatsMarins.value = {
          status: 'LOADED',
          value: {
            raw: data,
            statistiques,
            statsAnneesAfter2010: beforeToggleDate
              ? statsAnneesAfter2010.filter(
                  annee => annee.annee < anneeCurrent - 1
                )
              : statsAnneesAfter2010
          }
        }
      } catch (ex: any) {
        statistiquesGranulatsMarins.value = {
          status: 'ERROR',
          message: ex.message ?? 'something wrong happened'
        }
        console.error(ex)
      }
    })

    return () => (
      <>
        <div class="content">
          <div id="etat" class="mb-xxl mt">
            <h2>État du domaine minier en temps réel</h2>
            <span class="separator" />
            <p>
              Les données affichées ici sont celles contenues dans la base de
              donnée Camino. Elles sont susceptibles d’évoluer chaque jour au
              grès des décisions et de la fin de validité des titres et
              autorisations.
            </p>
            <p>
              Les surfaces cumulées concernées par un titre ou une autorisation
              n’impliquent pas qu’elles sont effectivement explorées ou
              exploitées sur tout ou partie de l'année. Les travaux miniers font
              l’objet de déclarations ou d’autorisations distinctes portant sur
              une partie seulement de la surface des titres miniers.
            </p>
            <div class="mb-xxl">
              <h3>Titres d’exploration</h3>
              <hr />
              <div class="tablet-blobs">
                <div class="tablet-blob-1-3">
                  <p class="h0 text-center">
                    <LoadingElement
                      data={statistiquesGranulatsMarins.value}
                      renderItem={item => (
                        <>{item.raw.titresInstructionExploration}</>
                      )}
                    />
                  </p>

                  <LoadingElement
                    data={statistiquesGranulatsMarins.value}
                    renderItem={item => {
                      if (item.raw.titresInstructionExploration > 1) {
                        return (
                          <div>
                            <p class="bold text-center">
                              Demandes en cours d'instruction (initiale et
                              modification en instance)
                            </p>
                          </div>
                        )
                      } else {
                        return (
                          <div>
                            <p class="bold text-center">
                              Demande en cours d'instruction (initiale et
                              modification en instance)
                            </p>
                          </div>
                        )
                      }
                    }}
                  />
                  <p class="h6 text-center">
                    <router-link
                      to={{
                        name: 'titres',
                        query: {
                          domainesIds: 'w',
                          typesIds: 'ar,ap,pr',
                          statutsIds: 'dmi,mod',
                          vueId: 'table'
                        }
                      }}
                    >
                      Voir les titres
                    </router-link>
                  </p>
                </div>
                <div class="tablet-blob-1-3">
                  <p class="h0 text-center">
                    <LoadingElement
                      data={statistiquesGranulatsMarins.value}
                      renderItem={item => <>{item.raw.titresValPrw}</>}
                    />
                  </p>
                  <p class="bold text-center">Permis exclusifs de recherches</p>
                  <p class="h6 text-center">
                    <router-link
                      to={{
                        name: 'titres',
                        query: {
                          domainesIds: 'w',
                          typesIds: 'pr',
                          statutsIds: 'val',
                          vueId: 'table'
                        }
                      }}
                    >
                      Voir les titres
                    </router-link>
                  </p>
                </div>
                <div class="tablet-blob-1-3">
                  <p class="h0 text-center">
                    <LoadingElement
                      data={statistiquesGranulatsMarins.value}
                      renderItem={item => (
                        <>{numberFormat(item.raw.surfaceExploration)} ha</>
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
              <h3>Titres d’exploitation</h3>
              <hr />
              <div class="tablet-blobs">
                <div class="tablet-blob-1-3">
                  <p class="h0 text-center">
                    <LoadingElement
                      data={statistiquesGranulatsMarins.value}
                      renderItem={item => (
                        <>{item.raw.titresInstructionExploitation}</>
                      )}
                    />
                  </p>
                  <LoadingElement
                    data={statistiquesGranulatsMarins.value}
                    renderItem={item => {
                      if (item.raw.titresInstructionExploitation > 1) {
                        return (
                          <div>
                            <p class="bold text-center">
                              Demandes en cours d'instruction (initiale et
                              modification en instance)
                            </p>
                          </div>
                        )
                      } else {
                        return (
                          <div>
                            <p class="bold text-center">
                              Demande en cours d'instruction (initiale et
                              modification en instance)
                            </p>
                          </div>
                        )
                      }
                    }}
                  />

                  <p class="h6 text-center">
                    <router-link
                      to={{
                        name: 'titres',
                        query: {
                          domainesIds: 'w',
                          typesIds: 'ax,cx,px',
                          statutsIds: 'dmi,mod',
                          vueId: 'table'
                        }
                      }}
                    >
                      Voir les titres
                    </router-link>
                  </p>
                </div>
                <div class="tablet-blob-1-3">
                  <p class="h0 text-center">
                    <LoadingElement
                      data={statistiquesGranulatsMarins.value}
                      renderItem={item => <>{item.raw.titresValCxw}</>}
                    />
                  </p>
                  <LoadingElement
                    data={statistiquesGranulatsMarins.value}
                    renderItem={item => (
                      <div>
                        <p class="bold text-center">
                          Concession{item.raw.titresValCxw > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  />

                  <p class="h6 text-center">
                    <router-link
                      to={{
                        name: 'titres',
                        query: {
                          domainesIds: 'w',
                          typesIds: 'cx',
                          statutsIds: 'val',
                          vueId: 'table'
                        }
                      }}
                    >
                      Voir les titres
                    </router-link>
                  </p>
                </div>
                <div class="tablet-blob-1-3">
                  <p class="h0 text-center">
                    <LoadingElement
                      data={statistiquesGranulatsMarins.value}
                      renderItem={item => (
                        <>{numberFormat(item.raw.surfaceExploitation)} ha</>
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

          <div class="line-neutral width-full mb" />

          <h2>Production annuelle</h2>
          <span class="separator" />
          <p class="mb-xl">
            Données contenues dans la base de données Camino, stabilisées pour
            l’année n-1.
          </p>

          <div class="tablet-pt-s pb-s">
            <LoadingElement
              data={statistiquesGranulatsMarins.value}
              renderItem={({ statsAnneesAfter2010 }) => {
                return (
                  <ConfigurableChart
                    chartConfiguration={barChartConfig(
                      statsBarFormat({
                        annees: statsAnneesAfter2010,
                        bar: 'volume',
                        line: 'masse',
                        labelBar: 'Volume en m³',
                        labelLine: 'Tonnage'
                      }),
                      Math.max(
                        ...statsAnneesAfter2010.map(annee => annee.volume)
                      )
                    )}
                  />
                )
              }}
            />
          </div>

          <div class="line-neutral width-full mb-xl" />
          <h5>Sélectionner une année</h5>

          <LoadingElement
            data={statistiquesGranulatsMarins.value}
            renderItem={item => {
              const annees = item.statsAnneesAfter2010.map(annee => {
                const id = annee.annee
                return {
                  id,
                  nom: id.toString(),
                  enConstruction: id === anneeCurrent - 1 // l'année en cours n'étant pas affichée, seule l'année précédente est affichée à partir du 1er avril de l'année courante
                }
              })
              return (
                <>
                  <select class="p-s mb-l full" onChange={anneeSelect}>
                    {annees.map(annee => (
                      <option
                        key={annee.id}
                        value={annee.id}
                        selected={anneeActive.value === annee.id}
                      >
                        {annee.nom}
                      </option>
                    ))}
                  </select>

                  <GranulatsMarinsActivite
                    statistiqueGranulatsMarins={
                      item.statistiques[anneeActive.value]
                    }
                    enConstruction={
                      annees.find(t => t.id === anneeActive.value)
                        ?.enConstruction
                    }
                  />
                </>
              )
            }}
          />

          <div class="line-neutral width-full mb-xl" />

          <div id="evolution" class="mb-xxl">
            <h2>Titres octroyés et surface</h2>
            <span class="separator" />
            <p>
              Données contenues dans la base de données Camino, concernant
              exclusivement le territoire français.
            </p>
            <h3>Permis exclusif de recherche (PER) octroyés</h3>
            <hr />
            <div class="tablet-float-blobs clearfix">
              <div class="tablet-float-blob-1-3 mb-xl mt">
                <p class="h0 text-center">
                  <LoadingElement
                    data={statistiquesGranulatsMarins.value}
                    renderItem={item => (
                      <>
                        {item.statistiques[anneeCurrent - 1].titresPrw.quantite}
                      </>
                    )}
                  />
                </p>
                <p>Permis exclusifs de recherches octroyés l’an dernier</p>
              </div>
              <div class="tablet-float-blob-2-3 relative mb-xl">
                <LoadingElement
                  data={statistiquesGranulatsMarins.value}
                  renderItem={item => (
                    <ConfigurableChart
                      chartConfiguration={barChartConfig(
                        statsBarFormat({
                          annees: item.raw.annees,
                          id: 'titresPrw',
                          bar: 'quantite',
                          line: 'surface',
                          labelBar: 'Permis de recherches',
                          labelLine: 'Surface des permis de recherches (ha)'
                        }),
                        suggestedMaxTitres('titresPrw', item.raw.annees)
                      )}
                    />
                  )}
                />
              </div>
            </div>
            <LoadingElement
              data={statistiquesGranulatsMarins.value}
              renderItem={({ statistiques, raw }) => {
                const statistiquesGranulatsMarinsAnneeCurrent = raw.annees.find(
                  annee => annee.annee === anneeCurrent
                )
                const pexAnneeCurrent =
                  (statistiquesGranulatsMarinsAnneeCurrent?.titresPxw
                    ?.quantite ?? 0) > 0

                return (
                  <>
                    {pexAnneeCurrent ? (
                      <div>
                        <h3>Permis d'exploitation (PEX) octroyés</h3>
                        <hr />
                        <div class="tablet-float-blobs clearfix">
                          <div class="tablet-float-blob-1-3 mb-xl mt">
                            <p class="h0 text-center">
                              {
                                statistiques[anneeCurrent - 1].titresPxw
                                  .quantite
                              }
                            </p>
                            <p>Permis d’exploitation octroyés l’an dernier</p>
                          </div>
                          <div class="tablet-float-blob-2-3 relative mb-xl">
                            <ConfigurableChart
                              chartConfiguration={barChartConfig(
                                statsBarFormat({
                                  annees: raw.annees,
                                  id: 'titresPxw',
                                  bar: 'quantite',
                                  line: 'surface',
                                  labelBar: "Permis d'exploitation",
                                  labelLine:
                                    "Surface des permis d'exploitation (ha)"
                                }),
                                suggestedMaxTitres('titresPxw', raw.annees)
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </>
                )
              }}
            />

            <h3>Concessions octroyées</h3>
            <hr />
            <div class="tablet-float-blobs clearfix">
              <div class="tablet-float-blob-1-3 mb-xl mt">
                <p class="h0 text-center">
                  <LoadingElement
                    data={statistiquesGranulatsMarins.value}
                    renderItem={item => (
                      <>
                        {item.statistiques[anneeCurrent - 1].titresCxw.quantite}
                      </>
                    )}
                  />
                </p>
                <p>Concessions octroyées l’an dernier</p>
              </div>
              <div class="tablet-float-blob-2-3 relative mb-xl">
                <LoadingElement
                  data={statistiquesGranulatsMarins.value}
                  renderItem={item => (
                    <ConfigurableChart
                      chartConfiguration={barChartConfig(
                        statsBarFormat({
                          annees: item.raw.annees,
                          id: 'titresCxw',
                          bar: 'quantite',
                          line: 'surface',
                          labelBar: 'Concessions',
                          labelLine: 'Surfaces des concessions (ha)'
                        }),
                        suggestedMaxTitres('titresCxw', item.raw.annees)
                      )}
                    />
                  )}
                />
              </div>
            </div>
            <h3>Concessions valides</h3>
            <hr />
            <div class="tablet-float-blobs clearfix">
              <div class="tablet-float-blob-1-3 mb-xl mt">
                <p class="h0 text-center">
                  <LoadingElement
                    data={statistiquesGranulatsMarins.value}
                    renderItem={item => (
                      <>
                        {
                          item.statistiques[anneeCurrent - 1].concessionsValides
                            .quantite
                        }
                      </>
                    )}
                  />
                </p>
                <p>Concessions valides l’an dernier</p>
              </div>
              <div class="tablet-float-blob-2-3 relative mb-xl">
                <LoadingElement
                  data={statistiquesGranulatsMarins.value}
                  renderItem={item => (
                    <ConfigurableChart
                      chartConfiguration={barChartConfig(
                        statsBarFormat({
                          annees: item.raw.annees,
                          id: 'concessionsValides',
                          bar: 'quantite',
                          line: 'surface',
                          labelBar: 'Concessions',
                          labelLine: 'Surfaces des concessions (ha)'
                        }),
                        suggestedMaxTitres(
                          'concessionsValides',
                          item.raw.annees
                        )
                      )}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
})
