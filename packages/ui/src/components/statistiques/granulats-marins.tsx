import { computed, defineComponent, onMounted, ref } from 'vue'
import Loader from '../_ui/loader.vue'
import GranulatsMarinsActivite from './granulats-marins-activite.vue'
import BarChart from '../_charts/bar.vue'
import { numberFormat } from '@/utils/number-format'
import { useStore } from 'vuex'
import { isEventWithTarget } from '@/utils/vue-tsx-utils'

interface StatAnnee {
  annee: number
  titresPrw: {
    quantite: number
    surface: number
  }
  titresPxw: {
    quantite: number
    surface: number
  }
  titresCxw: {
    quantite: number
    surface: number
  }
  volume: number
  masse: number
  activitesDeposesQuantite: number
  activitesDeposesRatio: number
  concessionsValides: {
    quantite: number
    surface: number
  }
}

interface Data {
  statistiquesGranulatsMarins: {
    annees: StatAnnee[]
    surfaceExploration: number
    surfaceExploitation: number
    titresInstructionExploration: number
    titresValPrw: number
    titresInstructionExploitation: number
    titresValCxw: number
  }
}

const ids = [
  'titresPrw',
  'titresPxw',
  'titresCxw',
  'concessionsValides'
] as const

const suggestedMaxCalc = (annees: StatAnnee[]) =>
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
  annees: StatAnnee[]
  id?: typeof ids[number]
  bar: 'volume' | 'quantite'
  line: 'masse' | 'surface'
  labelBar: string
  labelLine: string
}) =>
  annees.reduce<{
    labels: number[]
    datasets: {
      type: 'line' | 'bar'
      label: unknown
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

export const GranulatsMarins = defineComponent({
  setup() {
    const loaded = ref(false)
    const anneeActive = ref(0)
    const store = useStore()
    const statistiquesGranulatsMarins = computed<
      Data['statistiquesGranulatsMarins']
    >(() => {
      return store.state.statistiques.granulatsMarins
    })

    const statistiques = computed<Record<number, StatAnnee>>(() => {
      return statistiquesGranulatsMarins.value.annees.reduce<
        Record<string, any>
      >((acc, statsAnnee) => {
        acc[statsAnnee.annee] = statsAnnee

        return acc
      }, {})
    })

    const anneeCurrent = computed(() => {
      return new Date().getFullYear()
    })

    const annees = computed(() => {
      return statsAnneesAfter2010.value.map(annee => {
        const id = annee.annee
        return {
          id,
          nom: id.toString(),
          enConstruction: id === anneeCurrent.value - 1 // l'année en cours n'étant pas affichée, seule l'année précédente est affichée à partir du 1er avril de l'année courante
        }
      })
    })

    const suggestedMaxProduction = computed(() => {
      return Math.max(...statsAnneesAfter2010.value.map(annee => annee.volume))
    })

    const statsAnneesAfter2010 = computed(() => {
      const statsAnneesAfter2010 =
        statistiquesGranulatsMarins.value.annees.filter(
          annee => annee.annee >= 2010 && annee.annee < anneeCurrent.value
        )

      // affichage des données de l'année n-2 à partir du 1er avril de l'année en cours
      const toggleDate = new Date(anneeCurrent.value, 3, 1)
      const beforeToggleDate =
        new Date().getTime() < Date.parse(toggleDate.toString())

      return beforeToggleDate
        ? statsAnneesAfter2010.filter(
            annee => annee.annee < anneeCurrent.value - 1
          )
        : statsAnneesAfter2010
    })

    const pexAnneeCurrent = computed(() => {
      const statistiquesGranulatsMarinsAnneeCurrent =
        statistiquesGranulatsMarins.value.annees.find(
          annee => annee.annee === anneeCurrent.value
        )
      return (
        (statistiquesGranulatsMarinsAnneeCurrent?.titresPxw?.quantite ?? 0) > 0
      )
    })

    const get = async () => {
      await store.dispatch('statistiques/get', 'granulatsMarins')

      if (!loaded.value) {
        loaded.value = true
      }
    }

    const anneeSelect = (event: Event) => {
      if (isEventWithTarget(event)) {
        anneeActive.value = Number(event.target.value)
      }
    }
    const suggestedMaxTitres = (titreType: typeof ids[number]) => {
      const annees = statistiquesGranulatsMarins.value.annees

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
      anneeActive.value = anneeCurrent.value - 2
      await get()
    })

    return () => (
      <>
        {!loaded.value ? (
          <Loader class="content" />
        ) : (
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
                Les surfaces cumulées concernées par un titre ou une
                autorisation n’impliquent pas qu’elles sont effectivement
                explorées ou exploitées sur tout ou partie de l'année. Les
                travaux miniers font l’objet de déclarations ou d’autorisations
                distinctes portant sur une partie seulement de la surface des
                titres miniers.
              </p>
              <div class="mb-xxl">
                <h3>Titres d’exploration</h3>
                <hr />
                <div class="tablet-blobs">
                  <div class="tablet-blob-1-3">
                    <p class="h0 text-center">
                      {
                        statistiquesGranulatsMarins.value
                          .titresInstructionExploration
                      }
                    </p>
                    {statistiquesGranulatsMarins.value
                      .titresInstructionExploration > 1 ? (
                      <div>
                        <p class="bold text-center">
                          Demandes en cours d'instruction (initiale et
                          modification en instance)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p class="bold text-center">
                          Demande en cours d'instruction (initiale et
                          modification en instance)
                        </p>
                      </div>
                    )}
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
                      {statistiquesGranulatsMarins.value.titresValPrw}
                    </p>
                    <p class="bold text-center">
                      Permis exclusifs de recherches
                    </p>
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
                      {numberFormat(
                        statistiquesGranulatsMarins.value.surfaceExploration
                      )}
                      ha
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
                      {
                        statistiquesGranulatsMarins.value
                          .titresInstructionExploitation
                      }
                    </p>
                    {statistiquesGranulatsMarins.value
                      .titresInstructionExploitation > 1 ? (
                      <div>
                        <p class="bold text-center">
                          Demandes en cours d'instruction (initiale et
                          modification en instance)
                        </p>
                      </div>
                    ) : (
                      <div v-else>
                        <p class="bold text-center">
                          Demande en cours d'instruction (initiale et
                          modification en instance)
                        </p>
                      </div>
                    )}
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
                      {statistiquesGranulatsMarins.value.titresValCxw}
                    </p>
                    {statistiquesGranulatsMarins.value.titresValCxw > 1 ? (
                      <div>
                        <p class="bold text-center">Concessions</p>
                      </div>
                    ) : (
                      <div>
                        <p class="bold text-center">Concession</p>
                      </div>
                    )}
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
                      {numberFormat(
                        statistiquesGranulatsMarins.value.surfaceExploitation
                      )}
                      ha
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
              <BarChart
                data={statsBarFormat({
                  annees: statsAnneesAfter2010.value,
                  bar: 'volume',
                  line: 'masse',
                  labelBar: 'Volume en m³',
                  labelLine: 'Tonnage'
                })}
                suggestedMax={suggestedMaxProduction.value}
              />
            </div>

            <div class="line-neutral width-full mb-xl" />
            <h5>Sélectionner une année</h5>

            <select class="p-s mb-l full" onChange={anneeSelect}>
              {annees.value.map(annee => (
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
              statistiqueGranulatsMarins={statistiques.value[anneeActive.value]}
              enConstruction={
                annees.value.find(t => t.id === anneeActive.value)
                  ?.enConstruction
              }
              class="mb-xxl"
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
                    {
                      statistiques.value[anneeCurrent.value - 1].titresPrw
                        .quantite
                    }
                  </p>
                  <p>Permis exclusifs de recherches octroyés l’an dernier</p>
                </div>
                <div class="tablet-float-blob-2-3 relative mb-xl">
                  <BarChart
                    data={statsBarFormat({
                      annees: statistiquesGranulatsMarins.value.annees,
                      id: 'titresPrw',
                      bar: 'quantite',
                      line: 'surface',
                      labelBar: 'Permis de recherches',
                      labelLine: 'Surface des permis de recherches (ha)'
                    })}
                    suggestedMax={suggestedMaxTitres('titresPrw')}
                  />
                </div>
              </div>
              {pexAnneeCurrent.value ? (
                <div>
                  <h3>Permis d'exploitation (PEX) octroyés</h3>
                  <hr />
                  <div class="tablet-float-blobs clearfix">
                    <div class="tablet-float-blob-1-3 mb-xl mt">
                      <p class="h0 text-center">
                        {
                          statistiques.value[anneeCurrent.value - 1].titresPxw
                            .quantite
                        }
                      </p>
                      <p>Permis d’exploitation octroyés l’an dernier</p>
                    </div>
                    <div class="tablet-float-blob-2-3 relative mb-xl">
                      <BarChart
                        data={statsBarFormat({
                          annees: statistiquesGranulatsMarins.value.annees,
                          id: 'titresPxw',
                          bar: 'quantite',
                          line: 'surface',
                          labelBar: "Permis d'exploitation",
                          labelLine: "Surface des permis d'exploitation (ha)"
                        })}
                        suggestedMax={suggestedMaxTitres('titresPxw')}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <h3>Concessions octroyées</h3>
              <hr />
              <div class="tablet-float-blobs clearfix">
                <div class="tablet-float-blob-1-3 mb-xl mt">
                  <p class="h0 text-center">
                    {
                      statistiques.value[anneeCurrent.value - 1].titresCxw
                        .quantite
                    }
                  </p>
                  <p>Concessions octroyées l’an dernier</p>
                </div>
                <div class="tablet-float-blob-2-3 relative mb-xl">
                  <BarChart
                    data={statsBarFormat({
                      annees: statistiquesGranulatsMarins.value.annees,
                      id: 'titresCxw',
                      bar: 'quantite',
                      line: 'surface',
                      labelBar: 'Concessions',
                      labelLine: 'Surfaces des concessions (ha)'
                    })}
                    suggestedMax={suggestedMaxTitres('titresCxw')}
                  />
                </div>
              </div>
              <h3>Concessions valides</h3>
              <hr />
              <div class="tablet-float-blobs clearfix">
                <div class="tablet-float-blob-1-3 mb-xl mt">
                  <p class="h0 text-center">
                    {
                      statistiques.value[anneeCurrent.value - 1]
                        .concessionsValides.quantite
                    }
                  </p>
                  <p>Concessions valides l’an dernier</p>
                </div>
                <div class="tablet-float-blob-2-3 relative mb-xl">
                  <BarChart
                    data={statsBarFormat({
                      annees: statistiquesGranulatsMarins.value.annees,
                      id: 'concessionsValides',
                      bar: 'quantite',
                      line: 'surface',
                      labelBar: 'Concessions',
                      labelLine: 'Surfaces des concessions (ha)'
                    })}
                    suggestedMax={suggestedMaxTitres('concessionsValides')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }
})
