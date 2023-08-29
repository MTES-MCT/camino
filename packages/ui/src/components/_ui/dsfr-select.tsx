import { NonEmptyArray } from 'camino-common/src/typescript-tools'
import { isEventWithTarget } from '../../utils/vue-tsx-utils'
import { HTMLAttributes } from 'vue'

export type Item<T> = { id: T; label: string }
export type Props<T, Items extends Readonly<NonEmptyArray<Item<T>>>> = {
  id?: string
  items: Items
  legend: { main: string; visible?: boolean; description?: string; placeholder?: string }
  initialValue: Items[number]['id'] | null
  required?: boolean
  disabled?: boolean
  valueChanged: (id: Items[number]['id'] | null) => void
} & HTMLAttributes

export const DsfrSelect = <T, Items extends Readonly<NonEmptyArray<Item<T>>>>(props: Props<T, Items>): JSX.Element => {
  const id = props.id ?? `select_${(Math.random() * 1000).toFixed()}`

  return (
    <div class={['fr-select-group', props.disabled ? 'fr-select-group--disabled' : null]}>
      {props.legend.visible ?? true ? (
        <label class="fr-label" for={id}>
          {props.legend.main} {props.required ? ' *' : ''}
          {props.legend.description ? <span class="fr-hint-text">{props.legend.description}</span> : null}
        </label>
      ) : null}

      <select
        class="fr-select"
        id={id}
        aria-label={props.legend.main ?? undefined}
        disabled={props.disabled ?? false}
        name={id}
        onChange={event => (isEventWithTarget(event) ? props.valueChanged(event.target.value as T) : null)}
      >
        {props.items.map(({ id, label }) => (
          <option value={id} selected={props.initialValue === id}>
            {label}
          </option>
        ))}
        <option value="" selected={props.initialValue === null} disabled hidden>
          {props.legend.placeholder ? props.legend.placeholder : 'Selectionnez une option'}
        </option>
      </select>
    </div>
  )
}
