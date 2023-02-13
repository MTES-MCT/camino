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
  ChartType
} from 'chart.js'
import { ref, onMounted, onUnmounted, defineComponent } from 'vue'

Chart.register(
  LinearScale,
  PieController,
  ArcElement,
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
interface Props<TType extends ChartType> {
  chartConfiguration: ChartConfiguration<TType>
}

const GenericConfigurableChart = <TType extends ChartType>() =>
  defineComponent<Props<TType>>({
    props: ['chartConfiguration'] as unknown as undefined,
    setup(props) {
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
    }
  })

const HiddenConfigurableChart = GenericConfigurableChart()
export const ConfigurableChart = <TType extends ChartType = ChartType>(
  props: Props<TType>
): JSX.Element => {
  return (
    // TODO 2023-02-13: see https://github.com/chartjs/Chart.js/issues/10896#issuecomment-1374822435
    // @ts-ignore
    <HiddenConfigurableChart chartConfiguration={props.chartConfiguration} />
  )
}
