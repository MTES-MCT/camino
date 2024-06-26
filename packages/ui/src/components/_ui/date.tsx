import { CaminoDate, dateFormat } from 'camino-common/src/date'
import { FunctionalComponent } from 'vue'

interface Props {
  date: CaminoDate
}

export const DateComponent: FunctionalComponent<Props> = (props: Props) => {
  const dateValue = dateFormat(props.date)

  return <div style="white-space: nowrap">{dateValue}</div>
}
