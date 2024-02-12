import { CaminoDate } from 'camino-common/src/date'
import { FunctionalComponent } from 'vue'
import { InputDate } from '../_ui/input-date'

type Props = {
  date?: CaminoDate
  onDateChanged: (date: CaminoDate | null) => void
}

export const DateEdit: FunctionalComponent<Props> = props => {
  return (
    <div class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5>Date</h5>
      </div>
      <div class="tablet-blob-2-3">
        <InputDate dateChanged={props.onDateChanged} initialValue={props.date} class="mb-s" />
      </div>
    </div>
  )
}
