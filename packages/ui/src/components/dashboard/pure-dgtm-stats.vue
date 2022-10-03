<template>
  <div>
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr">
      <div>
        <LoadingElement v-slot="{ item }" :data="data"
          ><LineChart :data="graphSdomData(item)"
        /></LoadingElement>
      </div>
      <div>
        <LoadingElement v-slot="{ item }" :data="data"
          ><LineChart :data="graphDepoData(item)"
        /></LoadingElement>
      </div>
      <div>
        <LoadingElement v-slot="{ item }" :data="data"
          ><LineChart :data="graphDelaiData(item)"
        /></LoadingElement>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { AsyncData } from '@/api/client-rest'
import LineChart from '../_charts/line.vue'
import { CaminoAnnee, isAnnee } from 'camino-common/src/date'
import { nextColor } from '../_charts/utils'
import { SDOMZoneIds } from 'camino-common/src/static/sdom'

const data = ref<AsyncData<StatistiquesDGTM>>({ status: 'LOADING' })
const props = defineProps<{
  getDgtmStats: () => Promise<StatistiquesDGTM>
}>()

const datasetParams = (index: number) => {
  return {
    fill: false,
    tension: 0.5,
    backgroundColor: nextColor(index),
    borderColor: nextColor(index)
  }
}
const graphDepoData = (item: StatistiquesDGTM) => {
  const annees: CaminoAnnee[] = Object.keys(item.depotEtInstructions).filter(
    isAnnee
  )
  const datasets = []
  datasets.push({
    label: 'Titres déposés',
    data: annees.map(
      annee => item.depotEtInstructions[annee].totalTitresDeposes
    ),
    ...datasetParams(0)
  })
  datasets.push({
    label: 'Titres octroyés',
    data: annees.map(
      annee => item.depotEtInstructions[annee].totalTitresOctroyes
    ),
    ...datasetParams(1)
  })
  datasets.push({
    label: 'AEX octroyés',
    data: annees.map(
      annee => item.depotEtInstructions[annee].totalAXMOctroyees
    ),
    ...datasetParams(2)
  })
  datasets.push({
    label: 'AEX déposés',
    data: annees.map(annee => item.depotEtInstructions[annee].totalAXMDeposees),
    ...datasetParams(3)
  })

  return {
    labels: annees,
    datasets
  }
}
const graphSdomData = (item: StatistiquesDGTM) => {
  const annees: CaminoAnnee[] = Object.keys(item.sdom).filter(isAnnee)
  const datasets = []
  datasets.push({
    label: 'Déposés en zone 0',
    data: annees.map(annee => item.sdom[annee][SDOMZoneIds.Zone0].depose),
    ...datasetParams(0)
  })
  datasets.push({
    label: 'Octroyés en zone 0',
    data: annees.map(annee => item.sdom[annee][SDOMZoneIds.Zone0].octroye),
    ...datasetParams(1)
  })
  datasets.push({
    label: 'Déposés en zone 0 potentielle',
    data: annees.map(
      annee => item.sdom[annee][SDOMZoneIds.Zone0Potentielle].depose
    ),
    ...datasetParams(2)
  })
  datasets.push({
    label: 'Octroyés en zone 0 potentielle',
    data: annees.map(
      annee => item.sdom[annee][SDOMZoneIds.Zone0Potentielle].octroye
    ),
    ...datasetParams(3)
  })
  datasets.push({
    label: 'Déposés en zone 1',
    data: annees.map(annee => item.sdom[annee][SDOMZoneIds.Zone1].depose),
    ...datasetParams(4)
  })
  datasets.push({
    label: 'Octroyés en zone 1',
    data: annees.map(annee => item.sdom[annee][SDOMZoneIds.Zone1].octroye),
    ...datasetParams(5)
  })

  datasets.push({
    label: 'Déposés en zone 2',
    data: annees.map(annee => item.sdom[annee][SDOMZoneIds.Zone2].depose),
    ...datasetParams(6)
  })

  datasets.push({
    label: 'Octroyés en zone 2',
    data: annees.map(annee => item.sdom[annee][SDOMZoneIds.Zone2].octroye),
    ...datasetParams(7)
  })

  return {
    labels: annees,
    datasets
  }
}
const graphDelaiData = (item: StatistiquesDGTM) => {
  const annees: CaminoAnnee[] = Object.keys(item.delais).filter(isAnnee)
  const datasets = []
  datasets.push({
    label: "Délai minimun d'instruction",
    data: annees.map(annee =>
      Math.round(Math.min(...item.delais[annee].delaiInstructionEnJours) / 30)
    ),
    ...datasetParams(0)
  })
  datasets.push({
    label: "Délai moyen d'instruction",
    data: annees.map(annee =>
      Math.round(
        item.delais[annee].delaiInstructionEnJours.reduce(
          (acc, current) => acc + current,
          0
        ) /
          item.delais[annee].delaiInstructionEnJours.length /
          30
      )
    ),
    ...datasetParams(1)
  })
  datasets.push({
    label: "Délai maximum d'instruction",
    data: annees.map(annee =>
      Math.round(Math.max(...item.delais[annee].delaiInstructionEnJours) / 30)
    ),
    ...datasetParams(2)
  })
  datasets.push({
    label: 'Délai minimun de CDM',
    data: annees.map(annee =>
      Math.round(
        Math.min(...item.delais[annee].delaiCommissionDepartementaleEnJours) /
          30
      )
    ),
    ...datasetParams(3)
  })
  datasets.push({
    label: 'Délai moyen de CDM',
    data: annees.map(annee =>
      Math.round(
        item.delais[annee].delaiCommissionDepartementaleEnJours.reduce(
          (acc, current) => acc + current,
          0
        ) /
          item.delais[annee].delaiCommissionDepartementaleEnJours.length /
          30
      )
    ),
    ...datasetParams(4)
  })
  datasets.push({
    label: 'Délai maximum de CDM',
    data: annees.map(annee =>
      Math.round(
        Math.max(...item.delais[annee].delaiCommissionDepartementaleEnJours) /
          30
      )
    ),
    ...datasetParams(5)
  })

  return {
    labels: annees,
    datasets
  }
}

onMounted(async () => {
  try {
    const stats = await props.getDgtmStats()
    data.value = { status: 'LOADED', value: stats }
  } catch (e: any) {
    console.log('error', e)
    data.value = {
      status: 'ERROR',
      message: e.message ?? 'something wrong happened'
    }
  }
})
</script>
