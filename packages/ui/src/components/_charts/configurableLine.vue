<template>
  <canvas ref="myCanvas" />
</template>

<script setup lang="ts">
import {
  Chart,
  LinearScale,
  LineController,
  CategoryScale,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip,
  Title
} from 'chart.js'
import { onMounted, onUnmounted, ref } from 'vue'

Chart.register(
  LinearScale,
  LineController,
  CategoryScale,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Title,
  Tooltip
)

const props = defineProps<{
  // TODO 2022-09-29: Type this, this should be generic
  chartConfiguration: any
}>()

let chart: Chart | null = null
const myCanvas = ref<HTMLCanvasElement | null>(null)

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
