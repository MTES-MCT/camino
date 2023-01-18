import { saveAs } from 'file-saver'
import { Icon } from '@/components/_ui/icon'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { ChartConfiguration } from 'chart.js'
import { AsyncData } from '@/api/client-rest'
import { ConfigurableChart } from './configurable-chart'

export interface Props<T> {
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
  return (
    <LoadingElement
      data={props.data}
      renderItem={item => {
        return (
          <>
            <ConfigurableChart
              chartConfiguration={props.getConfiguration(item)}
            />
            <button
              class="btn-border py-xs px-s rnd-xs"
              style="position: absolute; top: 4px; right: 10px"
              title="Export CSV"
              onClick={() => exportCsv(props.getConfiguration(item))}
            >
              <Icon size="S" name="download" />
            </button>
          </>
        )
      }}
    />
  )
}
