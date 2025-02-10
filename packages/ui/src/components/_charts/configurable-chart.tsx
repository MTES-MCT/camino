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
import { JSX } from 'vue/jsx-runtime'
import chartjs2music from 'chartjs-plugin-chart2music'

type AutoyearlyDescription = {
  a11yDescription: 'autoyearlytable'
  description: string
}

type A11yDescription = {
  a11yDescription: JSX.Element
}

type AriaHidden = {
  ariaHidden: boolean
}
Chart.register(chartjs2music)
Chart.register(LinearScale, PieController, ArcElement, BarController, CategoryScale, BarElement, LineController, PointElement, LineElement, Filler, Legend, Tooltip, Title)
type Props<TType extends ChartType> = {
  chartConfiguration: ChartConfiguration<TType>
} & (A11yDescription | AriaHidden | AutoyearlyDescription)

export const ConfigurableChart = defineComponent(<TType extends ChartType = ChartType>(props: Props<TType>) => {
  const myCanvas = ref<HTMLCanvasElement | null>(null)
  let chart: Chart<TType> | null = null
  onMounted(() => {
    const context = myCanvas.value?.getContext('2d')
    if (!context) {
      console.error('le canvas ne devrait pas être null')
    } else {
      chart = new Chart<TType>(context, {
        ...props.chartConfiguration,
        // @ts-ignore 2025-01-23 type multiverse :sad:
        options: { ...props.chartConfiguration.options, plugins: { ...props.chartConfiguration.options?.plugins, chartjs2music: { lang: 'fr' } } },
      })
    }
  })

  onUnmounted(() => {
    if (chart !== null) {
      chart.destroy()
      chart = null
    }
  })

  const getA11yDescription = <TType extends ChartType>(caption: string, configuration: ChartConfiguration<TType>): JSX.Element => {
    return (
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th>Année</th>
            {configuration.data.datasets.map(d => (
              <th>{d.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {configuration.data.labels?.map((label, index) => (
            <tr>
              <td>{label}</td>
              {configuration.data.datasets.map(d => (
                <th>{typeof d.data[index] === 'number' && Number.isNaN(d.data[index]) ? 'Pas de donnée' : d.data[index]}</th>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return () => (
    <canvas ref={myCanvas} aria-hidden={'ariaHidden' in props ? props.ariaHidden : false}>
      {'a11yDescription' in props ? (props.a11yDescription === 'autoyearlytable' ? getA11yDescription(props.description, props.chartConfiguration) : props.a11yDescription) : null}
    </canvas>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
ConfigurableChart.props = ['chartConfiguration', 'a11yDescription', 'ariaHidden', 'description']
