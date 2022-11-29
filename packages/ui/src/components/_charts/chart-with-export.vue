<template>
  <LoadingElement v-slot="{ item }" :data="data">
    <ConfigurableChart :chartConfiguration="getConfiguration(item)" />

    <button
      class="btn-border py-xs px-s rnd-xs"
      style="position: absolute; top: 4px; right: 10px"
      title="Export CSV"
      @click="exportCsv(getConfiguration(item))"
    >
      <Icon size="S" name="download" />
    </button>
  </LoadingElement>
</template>

<script setup lang="ts" generic="T extends any">
import { saveAs } from 'file-saver'
import Icon from '@/components/_ui/icon.vue'
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { ChartConfiguration } from 'chart.js'
import { AsyncData } from '@/api/client-rest'
import ConfigurableChart from './configurable-chart.vue'

defineProps<{
  data: AsyncData<T>
  getConfiguration: (data: T) => ChartConfiguration
}>()

const exportCsv = (conf: ChartConfiguration) => {
  const title = conf.options?.plugins?.title?.text ?? 'export'

  let csv = ', ' + conf.data.labels?.join(', ')

  conf.data.datasets.forEach(dataset => {
    csv += `\r\n ${dataset.label ?? ''}, ${dataset.data.join(', ')}`
  })

  const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `${title}.csv`)
}
</script>
