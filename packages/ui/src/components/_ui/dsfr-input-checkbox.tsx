import { caminoDefineComponent, isEventWithTarget, random } from '@/utils/vue-tsx-utils'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

export type Props = {
  id?: string
  legend: { main: string; description?: string }
  disabled?: boolean
  valueChanged: (value: boolean) => void
  initialValue?: boolean | null
}

export const DsfrInputCheckbox = caminoDefineComponent<Props>(['id', 'initialValue', 'valueChanged', 'legend', 'disabled'], props => {
  const id = props.id ?? `checkbox_${(random() * 1000).toFixed()}`

  const updateFromEvent = (e: Event) => {
    if (isEventWithTarget(e)) {
      props.valueChanged(e.target.checked)
    }
  }

  return () => (
    <div class="fr-checkbox-group">
      <input onInput={updateFromEvent} disabled={props.disabled ?? false} checked={props.initialValue ?? false} name="archive" id={id} type="checkbox" />
      <label class="fr-label" for={id}>
        {props.legend.main}
        {isNotNullNorUndefinedNorEmpty(props.legend.description) ? <span class="fr-hint-text">{props.legend.description}</span> : null}
      </label>
    </div>
  )
})
