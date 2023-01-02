import { dateFormat } from '@/utils'
import { CaminoDate } from 'camino-common/src/date'

export interface Props {
  date: CaminoDate
}

export function Date(props: Props) {
  const dateValue = dateFormat(props.date)
  return <div style="white-space: nowrap">{dateValue}</div>
}
