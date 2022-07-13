<template>
  <canvas ref="canvas" />
</template>

<script>
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

export default {
  props: {
    data: { type: Object, required: true }
  },

  data() {
    return {
      canvas: null,
      chart: null
    }
  },

  mounted() {
    this.canvas = this.$refs.canvas

    this.chart = new Chart(this.canvas.getContext('2d'), {
      type: 'line',
      data: this.data,
      options: {
        locale: 'fr-FR',
        aspectRatio: 1.33
      }
    })
  },
  unmounted() {
    this.chart = null
  }
}
</script>
