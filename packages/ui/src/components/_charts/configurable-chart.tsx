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
  ChartConfiguration,
  PieController,
  ArcElement,
  ChartType,
} from 'chart.js'
import { ref, onMounted, onUnmounted, defineComponent } from 'vue'

Chart.register(LinearScale, PieController, ArcElement, BarController, CategoryScale, BarElement, LineController, PointElement, LineElement, Filler, Legend, Tooltip, Title)
interface Props<TType extends ChartType> {
  chartConfiguration: ChartConfiguration<TType>
}

export const ConfigurableChart = defineComponent(<TType extends ChartType = ChartType>(props: Props<TType>) => {
  const myCanvas = ref<HTMLCanvasElement | null>(null)
  let chart: Chart<TType> | null = null
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
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
ConfigurableChart.props = ['chartConfiguration']
