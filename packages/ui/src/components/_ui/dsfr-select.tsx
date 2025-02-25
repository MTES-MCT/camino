import { NonEmptyArray, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { isEventWithTarget } from '../../utils/vue-tsx-utils'
import { HTMLAttributes } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
export type Item<T> = { id: T; label: string; disabled?: boolean }
type Props<T, Items extends Readonly<NonEmptyArray<Item<T>>>> = {
  id: string
  items: Items
  legend: { main: string; visible?: boolean; description?: string; placeholder?: string }
  initialValue: Items[number]['id'] | null
  required: boolean
  disabled?: boolean
  valueChanged: (id: NoInfer<Items>[number]['id'] | null) => void
} & HTMLAttributes

export const DsfrSelect = <T, Items extends Readonly<NonEmptyArray<Item<T>>>>(props: Props<T, Items>): JSX.Element => {
  return (
    <div class={['fr-select-group', (props.disabled ?? false) ? 'fr-select-group--disabled' : null]}>
      {(props.legend.visible ?? true) ? (
        <label class="fr-label" for={props.id}>
          {props.legend.main} {props.required ? '' : ' (optionnel)'}
          {isNotNullNorUndefinedNorEmpty(props.legend.description) ? <span class="fr-hint-text">{props.legend.description}</span> : null}
        </label>
      ) : null}

      <select
        class="fr-select"
        id={props.id}
        aria-label={props.legend.main ?? undefined}
        disabled={props.disabled ?? false}
        name={props.id}
        value={props.initialValue}
        onChange={event => (isEventWithTarget(event) ? props.valueChanged(event.target.value as Items[number]['id']) : null)}
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
