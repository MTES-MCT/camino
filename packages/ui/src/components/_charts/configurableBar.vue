<template>
  <canvas ref="myCanvas" />
</template>

<script setup lang="ts">
import {
  Chart,
  LinearScale,
  BarController,
  CategoryScale,
  BarElement,
  LineController,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip,
  Title
} from 'chart.js'
import { withDefaults, ref, onMounted, onUnmounted } from 'vue'

Chart.register(
  LinearScale,
  BarController,
  CategoryScale,
  BarElement,
  LineController,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip,
  Title
)

const props = withDefaults(
  defineProps<{
    // TODO 2022-09-29: Type this, this should be generic
    chartConfiguration: any
    aspectRatio?: number
    suggestedMax?: number
  }>(),
  { aspectRatio: 2, suggestedMax: 0 }
)

const myCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
onMounted(() => {
  const context = myCanvas.value?.getContext('2d')
  if (!context) {
    console.error('le canvas ne devrait pas être null')
  } else {
    chart = new Chart(context, props.chartConfiguration)
  }
})

onUnmounted(() => {
  if (chart !== null) {
    chart.destroy()
    chart = null
  }
})
</script>
