import { saveAs } from 'file-saver'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { ChartConfiguration } from 'chart.js'
import { AsyncData } from '@/api/client-rest'
import { defineAsyncComponent } from 'vue'
import { ButtonIcon } from '../_ui/button-icon'

interface Props<T> {
  data: AsyncData<T>
  getConfiguration: (data: T) => ChartConfiguration
}

const exportCsv = (conf: ChartConfiguration) => {
  const title = conf.options?.plugins?.title?.text ?? 'export'

  let csv = ', ' + conf.data.labels?.join(', ')

  conf.data.datasets.forEach(dataset => {
    csv += `\r\n ${dataset.label ?? ''}, ${dataset.data.join(', ')}`
  })

  const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `${title}.csv`)
}

export const ChartWithExport = <T,>(props: Props<T>): JSX.Element => {
  const ConfigurableChart = defineAsyncComponent(async () => {
    const { ConfigurableChart } = await import('./configurable-chart')

    return ConfigurableChart
  })

  return (
    <LoadingElement
      data={props.data}
      renderItem={item => {
        return (
          <div style="position: relative">
            <ConfigurableChart chartConfiguration={props.getConfiguration(item)} />
            <ButtonIcon
              class="btn-border py-xs px-s rnd-xs"
              style="position: absolute; top: 4px; right: 10px"
              title="Exporter au format CSV"
              onClick={() => exportCsv(props.getConfiguration(item))}
              icon="download"
              iconSize="S"
            />
          </div>
        )
      }}
    />
  )
}
