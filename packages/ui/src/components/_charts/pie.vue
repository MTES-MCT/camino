<template>
  <canvas ref="canvas" />
</template>

<script>
import { Chart, PieController, ArcElement } from 'chart.js'

Chart.register(PieController, ArcElement)

export default {
  props: {
    data: { type: Object, required: true }
  },

  data() {
    return {
      canvas: null
    }
  },

  mounted() {
    this.canvas = this.$refs.canvas

    // eslint-disable-next-line no-new
    new Chart(this.canvas.getContext('2d'), {
      type: 'pie',
      data: this.data,
      options: {
        locale: 'fr-FR',
        aspectRatio: 1.33
      }
    })
  }
}
</script>
