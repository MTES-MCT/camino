import { NonEmptyArray, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { isEventWithTarget, random } from '../../utils/vue-tsx-utils'
import { DeepReadonly, HTMLAttributes } from 'vue'

export type Item<T> = { id: T; label: string; disabled?: boolean }
type Props<T, Items extends DeepReadonly<NonEmptyArray<Item<T>>>> = {
  id?: string
  items: Items
  legend: { main: string; visible?: boolean; description?: string; placeholder?: string }
  initialValue: Items[number]['id'] | null
  required?: boolean
  disabled?: boolean
  valueChanged: (id: DeepReadonly<Items[number]['id'] | null>) => void
} & HTMLAttributes

export const DsfrSelect = <T, Items extends DeepReadonly<NonEmptyArray<Item<T>>>>(props: Props<T, Items>): JSX.Element => {
  const id = props.id ?? `select_${(random() * 1000).toFixed()}`

  return (
    <div class={['fr-select-group', props.disabled ?? false ? 'fr-select-group--disabled' : null]}>
      {props.legend.visible ?? true ? (
        <label class="fr-label" for={id}>
          {props.legend.main} {props.required ?? false ? ' *' : ''}
          {isNotNullNorUndefinedNorEmpty(props.legend.description) ? <span class="fr-hint-text">{props.legend.description}</span> : null}
        </label>
      ) : null}

      <select
        class="fr-select"
        id={id}
        aria-label={props.legend.main ?? undefined}
        disabled={props.disabled ?? false}
        name={id}
        value={props.initialValue}
        onChange={event => (isEventWithTarget(event) ? props.valueChanged(event.target.value as DeepReadonly<Items[number]['id']>) : null)}
      >
        {props.items.map(({ id, label, disabled }) => (
          <option value={id} selected={props.initialValue === id} disabled={disabled}>
            {label}
          </option>
        ))}
        <option value="" selected={props.initialValue === null} disabled hidden>
          {isNotNullNorUndefinedNorEmpty(props.legend.placeholder) ? props.legend.placeholder : 'Selectionnez une option'}
        </option>
      </select>
    </div>
  )
}
