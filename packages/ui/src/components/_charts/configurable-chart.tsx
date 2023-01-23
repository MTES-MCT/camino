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
import { ref, onMounted, onUnmounted, defineComponent } from 'vue'

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
interface Props {
  chartConfiguration: ChartConfiguration
}

export const ConfigurableChart = defineComponent<Props>({
  props: ['chartConfiguration'] as unknown as undefined,
  setup(props) {
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

    return () => <canvas ref={myCanvas} />
  }
})
