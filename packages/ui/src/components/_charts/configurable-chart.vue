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
  Title,
  ChartConfiguration
} from 'chart.js'
import { ref, onMounted, onUnmounted } from 'vue'

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

const props = defineProps<{
  chartConfiguration: ChartConfiguration
}>()

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
