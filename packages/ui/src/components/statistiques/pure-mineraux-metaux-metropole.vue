<template>
  <div class="content">
    <div id="etat" class="mb-xxl mt">
      <h2>
        État du domaine minier des substances non énergétiques, en métropole, en
        temps réel
      </h2>
      <span class="separator" />
      <p>
        Les données affichées ici sont celles contenues dans la base de donnée
        Camino. Elles sont susceptibles d’évoluer chaque jour au grès des
        décisions et de la fin de validité des titres et autorisations.
      </p>
      <p>
        Les surfaces cumulées concernées par un titre ou une autorisation
        n’impliquent pas qu’elles sont effectivement explorées ou exploitées sur
        tout ou partie de l'année. Les travaux miniers font l’objet de
        déclarations ou d’autorisations distinctes portant sur une partie
        seulement de la surface des titres miniers.
      </p>
      <div class="mb-xxl">
        <h3>Titres d’exploration</h3>
        <hr />
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3">
            <p class="h0 text-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ item.titres.instructionExploration }}
              </LoadingElement>
            </p>
            <div>
              <p class="bold text-center">
                Demande{{
                  data.status === 'LOADED' &&
                  data.value.titres.instructionExploration > 1
                    ? 's'
                    : ''
                }}
                en cours d'instruction (initiale et modification en instance)
              </p>
            </div>
            <p class="h6 text-center">
              <router-link
                :to="{
                  name: 'titres',
                  query: {
                    domainesIds: 'm',
                    typesIds: 'ar,ap,pr',
                    statutsIds: 'dmi,mod',
                    territoires: 'FR',
                    vueId: 'table'
                  }
                }"
              >
                Voir les titres
              </router-link>
            </p>
          </div>
          <div class="tablet-blob-1-3">
            <p class="h0 text-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ item.titres.valPrm }}
              </LoadingElement>
            </p>
            <p class="bold text-center">Permis exclusifs de recherches</p>
            <p class="h6 text-center">
              <router-link
                :to="{
                  name: 'titres',
                  query: {
                    domainesIds: 'm',
                    typesIds: 'pr',
                    statutsIds: 'val',
                    territoires: 'FR',
                    vueId: 'table'
                  }
                }"
              >
                Voir les titres
              </router-link>
            </p>
          </div>
          <div class="tablet-blob-1-3">
            <p class="h0 text-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ numberFormat(item.surfaceExploration) }} ha
              </LoadingElement>
            </p>
            <p class="bold text-center">
              Surfaces cumulées des titres pouvant faire l'objet d'une activité
              d’exploration
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
              <LoadingElement v-slot="{ item }" :data="data">
                {{ item.titres.instructionExploitation }}
              </LoadingElement>
            </p>
            <div>
              <p class="bold text-center">
                Demande{{
                  data.status === 'LOADED' &&
                  data.value.titres.instructionExploitation > 1
                    ? 's'
                    : ''
                }}
                en cours d'instruction (initiale et modification en instance)
              </p>
            </div>
            <p class="h6 text-center">
              <router-link
                :to="{
                  name: 'titres',
                  query: {
                    domainesIds: 'm',
                    typesIds: 'ax,cx,px',
                    statutsIds: 'dmi,mod',
                    territoires: 'FR',
                    vueId: 'table'
                  }
                }"
              >
                Voir les titres
              </router-link>
            </p>
          </div>
          <div class="tablet-blob-1-3">
            <p class="h0 text-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ item.titres.valCxm }}
              </LoadingElement>
            </p>
            <div>
              <p class="bold text-center">
                Concession{{
                  data.status === 'LOADED' && data.value.titres.valCxm > 1
                    ? 's'
                    : ''
                }}
              </p>
            </div>
            <p class="h6 text-center">
              <router-link
                :to="{
                  name: 'titres',
                  query: {
                    domainesIds: 'm',
                    typesIds: 'cx',
                    statutsIds: 'val',
                    territoires: 'FR',
                    vueId: 'table'
                  }
                }"
              >
                Voir les titres
              </router-link>
            </p>
          </div>
          <div class="tablet-blob-1-3">
            <p class="h0 text-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ numberFormat(item.surfaceExploitation) }} ha
              </LoadingElement>
            </p>
            <p class="bold text-center">
              Surfaces cumulées des titres pouvant faire l'objet d'une activité
              d’exploitation
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="line-neutral width-full mb" />

    <h2>
      Production annuelle et fiscalité minière des ressources minérales non
      énergétiques, par famille de substances
    </h2>
    <span class="separator" />
    <p class="mb-xl">
      Données contenues dans la base de données Camino, stabilisées pour l’année
      n-1.
    </p>

    <div class="grid-container">
      <div style="grid-column-end: span 2">
        <h3>Bauxite</h3>
        <hr />
      </div>
      <div>
        <ChartWithExport
          :data="data"
          :getConfiguration="item => bauxiteChartConfiguration(item)"
        />
      </div>
      <div>
        <h4>Fiscalité minière</h4>
        <p>
          Les données sont calculées à partir des données de production. Il
          s'agit des sommes dûes et non des recettes effectivement perçues par
          les finances publiques.
        </p>
        <div class="flex">
          <div
            v-for="tab in anneesBauxite"
            :key="tab"
            class="mr-xs"
            :class="{ active: bauxiteTabId === tab }"
          >
            <button
              :id="`cmn-titre-tab-${tab}`"
              class="p-m btn-tab rnd-t-s"
              @click="bauxiteTabUpdate(tab)"
            >
              {{ tab }}
            </button>
          </div>
        </div>
        <div class="line-neutral mb" />
        <p>
          Sommes dûes par les opérateurs miniers exploitant de la bauxite au
          titre des redevances départementale et communale des mines, hors frais
          de gestion
        </p>
        <p class="h1 text-center color-info bold">
          <LoadingElement :data="data">
            {{ numberFormat(bauxiteFiscalite) }} €
          </LoadingElement>
        </p>
      </div>
      <div style="grid-column-end: span 2">
        <h3>Sels (sel de sodium, sel de potassium, sel gemme…)</h3>
        <hr />
      </div>
      <ChartWithExport
        :data="data"
        :getConfiguration="item => selsChartConfiguration(item)"
      />
      <div>
        <h4>Fiscalité minière</h4>
        <p>
          Les données sont calculées à partir des données de production. Il
          s'agit des sommes dûes et non des recettes effectivement perçues par
          les finances publiques.
        </p>
        <div class="flex">
          <div
            v-for="tab in anneesSels"
            :key="tab"
            class="mr-xs"
            :class="{ active: selsTabId === tab }"
          >
            <button
              :id="`cmn-titre-tab-${tab}`"
              class="p-m btn-tab rnd-t-s"
              @click="selsTabUpdate(tab)"
            >
              {{ tab }}
            </button>
          </div>
        </div>
        <div class="line-neutral mb" />
        <p>
          Sommes dûes par les opérateurs miniers exploitant des sels au titre
          des redevances départementale et communale des mines, hors frais de
          gestion
        </p>
        <p class="h1 text-center color-info bold">
          <LoadingElement :data="data">
            {{ numberFormat(selsFiscalite) }} €
          </LoadingElement>
        </p>
      </div>
      <div style="grid-column-end: span 2">
        <h3>Autres substances</h3>
        <hr />
      </div>
      <div style="grid-column-end: span 2">
        Pour les autres substances de mines exploitées en métropole,
        l'agrégation des données n'est pas possible en raison du nombre limité
        d'exploitant par type de substance.
        <br />
        <br />
        Au titre du secret des informations économiques et financières, les
        volumes d'exploitation ne sont pas communicables.
      </div>
    </div>
    <div class="line-neutral width-full mb mt" />
    <h2>Evolution du nombre de titre et de leur surface</h2>
    <span class="separator" />
    <p class="mb-xl">
      Les données affichées ici sont celles contenues dans la base de donnée
      Camino. Ces données concernent exclusivement le territoire métropolitain.
    </p>
    <div class="mb-xl">
      <h3>Permis Exclusif de Recherche (PER)</h3>
      <hr />
      <ChartWithExport
        :data="data"
        :getConfiguration="item => perChartConfiguration(item)"
      />
    </div>
    <div class="mb-xl">
      <h3>Concession</h3>
      <hr />
      <ChartWithExport
        :data="data"
        :getConfiguration="item => concessionChartConfiguration(item)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChartWithExport from '../_charts/chart-with-export.vue'

import { AsyncData } from '@/api/client-rest'
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { numberFormat } from '@/utils/number-format'
import { CaminoAnnee, isAnnee } from 'camino-common/src/date'
import { StatistiquesMinerauxMetauxMetropole } from 'camino-common/src/statistiques'
import { ref, onMounted } from 'vue'
import { ChartConfiguration, ChartData, ChartDataset } from 'chart.js'
import {
  SubstancesFiscale,
  SUBSTANCES_FISCALES_IDS
} from 'camino-common/src/static/substancesFiscales'
import { Unites } from 'camino-common/src/static/unites'
import { onlyUnique } from 'camino-common/src/typescript-tools'
import { RegionId, isRegionId, Regions } from 'camino-common/src/static/region'
import { CHART_COLORS, nextColor } from '../_charts/utils'
const data = ref<AsyncData<StatistiquesMinerauxMetauxMetropole>>({
  status: 'LOADING'
})

const anneesBauxite = ref<CaminoAnnee[]>([])

const bauxiteTabId = ref<CaminoAnnee>(
  anneesBauxite.value[anneesBauxite.value.length - 1]
)

const bauxiteFiscalite = ref<number>(0)

const bauxiteTabUpdate = async (annee: CaminoAnnee): Promise<void> => {
  if (annee !== bauxiteTabId.value) {
    bauxiteTabId.value = annee
    if (data.value.status === 'LOADED') {
      bauxiteFiscalite.value =
        data.value.value.fiscaliteParSubstanceParAnnee[
          SUBSTANCES_FISCALES_IDS.bauxite
        ]?.[annee] ?? 0
    }
  }
}
const anneesSels = ref<CaminoAnnee[]>([])

const selsTabId = ref<CaminoAnnee>(
  anneesSels.value[anneesSels.value.length - 1]
)

const selsFiscalite = ref<number>(0)

const selsTabUpdate = async (annee: CaminoAnnee): Promise<void> => {
  if (annee !== selsTabId.value) {
    selsTabId.value = annee
    if (data.value.status === 'LOADED') {
      selsFiscalite.value =
        data.value.value.fiscaliteParSubstanceParAnnee[
          SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_
        ]?.[annee] +
          data.value.value.fiscaliteParSubstanceParAnnee[
            SUBSTANCES_FISCALES_IDS
              .sel_ChlorureDeSodium_extraitEnDissolutionParSondage
          ]?.[annee] +
          data.value.value.fiscaliteParSubstanceParAnnee[
            SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage
          ]?.[annee] ?? 0
    }
  }
}
const props = defineProps<{
  getStats: () => Promise<StatistiquesMinerauxMetauxMetropole>
}>()

const bauxiteChartConfiguration = (
  data: StatistiquesMinerauxMetauxMetropole
): ChartConfiguration => {
  const annees: CaminoAnnee[] = Object.keys(data.substances.aloh).filter(
    isAnnee
  )
  const label = Unites[SubstancesFiscale.aloh.uniteId].nom
  const chartData: ChartData = {
    labels: annees,
    datasets: [
      {
        type: 'bar',
        yAxisID: 'bar',
        data: annees.map(annee => data.substances.aloh[annee] ?? 0),
        backgroundColor: 'rgb(118, 182, 189)'
      }
    ]
  }
  return {
    type: 'bar',
    data: chartData,
    options: {
      locale: 'fr-FR',
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: `Production Bauxite (${
            Unites[SubstancesFiscale.naca.uniteId].nom
          })`,
          font: {
            size: 16
          }
        }
      }
    }
  }
}

const selsChartConfiguration = (
  data: StatistiquesMinerauxMetauxMetropole
): ChartConfiguration => {
  const annees: CaminoAnnee[] = [
    ...Object.keys(data.substances.naca),
    ...Object.keys(data.substances.nacb),
    ...Object.keys(data.substances.nacc)
  ]
    .filter(isAnnee)
    .filter(onlyUnique)

  const regionsIds: RegionId[] = annees
    .flatMap(annee => [
      ...Object.keys(data.substances?.naca[annee] ?? {}),
      ...Object.keys(data.substances?.nacb[annee] ?? {}),
      ...Object.keys(data.substances?.nacc[annee] ?? {})
    ])
    .filter(isRegionId)
    .filter(onlyUnique)

  const datasetByRegion: ChartDataset[] = regionsIds.map((regionId, index) => {
    const label = Regions[regionId].nom
    const sum = (annee: CaminoAnnee) =>
      (data.substances.naca[annee]?.[regionId] ?? 0) +
      (data.substances.nacb[annee]?.[regionId] ?? 0) +
      (data.substances.nacc[annee]?.[regionId] ?? 0)
    return {
      type: 'bar',
      label: label[0].toUpperCase() + label.substring(1),
      data: annees.map(sum),
      backgroundColor: nextColor(index)
    }
  })
  const chartData: ChartData = {
    labels: annees,
    datasets: datasetByRegion
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
          text: `Production Sels (${
            Unites[SubstancesFiscale.naca.uniteId].nom
          })`,
          font: {
            size: 16
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          stacked: true
        },
        y: { stacked: true }
      }
    }
  }
}

const perChartConfiguration = (
  data: StatistiquesMinerauxMetauxMetropole
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

  return {
    type: 'bar',
    data: chartData,
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
  }
}

const concessionChartConfiguration = (
  data: StatistiquesMinerauxMetauxMetropole
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
        label: 'Surface cumulée des concessions (ha) accordées',
        yAxisID: 'surface',
        data: annees.map(annee => data.cxm.surface[annee]),
        backgroundColor: CHART_COLORS.blue
      }
    ]
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
  }
}

onMounted(async () => {
  try {
    const stats = await props.getStats()
    data.value = {
      status: 'LOADED',
      value: stats
    }
    anneesBauxite.value = Object.keys(
      stats.fiscaliteParSubstanceParAnnee[SUBSTANCES_FISCALES_IDS.bauxite]
    )
      .filter(isAnnee)
      .sort()
    anneesSels.value = [
      ...Object.keys(
        stats.fiscaliteParSubstanceParAnnee[
          SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_
        ]
      ),
      ...Object.keys(
        stats.fiscaliteParSubstanceParAnnee[
          SUBSTANCES_FISCALES_IDS
            .sel_ChlorureDeSodium_extraitEnDissolutionParSondage
        ]
      ),
      ...Object.keys(
        stats.fiscaliteParSubstanceParAnnee[
          SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage
        ]
      )
    ]
      .filter(isAnnee)
      .filter(onlyUnique)
      .sort()
    bauxiteTabUpdate(anneesBauxite.value[anneesBauxite.value.length - 1])
    selsTabUpdate(anneesSels.value[anneesSels.value.length - 1])
  } catch (e: any) {
    console.error(e)
    data.value = {
      status: 'ERROR',
      message: e.message ?? "Une erreur s'est produite"
    }
  }
})
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: repeat(4, auto);
  gap: 3rem;
}
</style>
