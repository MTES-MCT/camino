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
  Tooltip
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
  Tooltip
)

const props = defineProps<{
  // TODO 2022-09-29: Type this, this should be generic
  data: any
}>()

let chart: Chart | null = null
const myCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const context = myCanvas.value?.getContext('2d')
  if (!context) {
    console.error('le canvas ne devrait pas être null')
  } else {
    chart = new Chart(context, {
      type: 'line',
      data: props.data,
      options: {
        locale: 'fr-FR',
        responsive: true,
        aspectRatio: 1.33,
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    })
  }
})

onUnmounted(() => {
  if (chart !== null) {
    chart.destroy()
    chart = null
  }
})
</script>
