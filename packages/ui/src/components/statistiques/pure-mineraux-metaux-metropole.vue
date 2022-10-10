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

    <h2>Production annuelle</h2>
    <span class="separator" />
    <p class="mb-xl">
      Données contenues dans la base de données Camino, stabilisées pour l’année
      n-1.
    </p>

    <LoadingElement v-slot="{ item }" :data="data">
      <BarChart :chartConfiguration="bauxiteChartConfiguration(item)" />
    </LoadingElement>
    <LoadingElement v-slot="{ item }" :data="data">
      <BarChart :chartConfiguration="selsChartConfiguration(item)" />
    </LoadingElement>
  </div>
</template>

<script setup lang="ts">
import BarChart from '../_charts/configurableBar.vue'

import { AsyncData } from '@/api/client-rest'
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { numberFormat } from '@/utils/number-format'
import { CaminoAnnee, isAnnee } from 'camino-common/src/date'
import { StatistiquesMinerauxMetauxMetropole } from 'camino-common/src/statistiques'
import { ref, onMounted } from 'vue'
import { ChartConfiguration, ChartData, ChartDataset } from 'chart.js'
import { SubstancesFiscale } from 'camino-common/src/static/substancesFiscales'
import { Unites } from 'camino-common/src/static/unites'
import { onlyUnique } from 'camino-common/src/typescript-tools'
import { RegionId, isRegionId, Regions } from 'camino-common/src/static/region'
import { nextColor } from '../_charts/utils'
const data = ref<AsyncData<StatistiquesMinerauxMetauxMetropole>>({
  status: 'LOADING'
})

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
        label: label[0].toUpperCase() + label.substring(1),
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
        title: {
          display: true,
          text: 'Production Bauxite'
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
          })`
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

onMounted(async () => {
  try {
    const stats = await props.getStats()
    data.value = {
      status: 'LOADED',
      value: stats
    }
  } catch (e: any) {
    console.log('error', e)
    data.value = {
      status: 'ERROR',
      message: e.message ?? "Une erreur s'est produite"
    }
  }
})
</script>
