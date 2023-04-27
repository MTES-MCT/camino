import { dateFormat } from '@/utils'
import { CaminoDate } from 'camino-common/src/date'
import { FunctionalComponent } from 'vue'

export interface Props {
  date: CaminoDate
}

export const DateComponent: FunctionalComponent<Props> = (props: Props) => {
  const dateValue = dateFormat(props.date)
  return <div style="white-space: nowrap">{dateValue}</div>
}
