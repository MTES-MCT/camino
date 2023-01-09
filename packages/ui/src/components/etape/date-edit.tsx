import { CaminoDate } from 'camino-common/src/date'
import { FunctionalComponent } from 'vue'
import InputDate from '../_ui/input-date.vue'

export type Props = {
  incertitude?: boolean
  date?: CaminoDate
  onDateChanged: (date: CaminoDate) => void
  onIncertitudeChanged: (incertitude: boolean) => void
}

// FIXME 2023-01-03 : add to typescript vue type utils
const isEventWithTarget = (
  event: any
): event is InputEvent & { target: HTMLInputElement } => event.target

export const DateEdit: FunctionalComponent<Props> = props => {
  return (
    <div class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5>Date</h5>
      </div>
      <div class="tablet-blob-2-3">
        <InputDate
          modelValue={props.date}
          onUpdate:modelValue={props.onDateChanged}
          class="mb-s"
        />
        <div class="h6">
          {props.date ? (
            <label>
              <input
                checked={props.incertitude}
                onChange={event =>
                  isEventWithTarget(event)
                    ? props.onIncertitudeChanged(event.target.checked)
                    : null
                }
                type="checkbox"
                class="mr-xs"
              />
              Incertain
            </label>
          ) : null}
        </div>
      </div>

      <hr />
    </div>
  )
}
