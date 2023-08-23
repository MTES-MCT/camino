import { NonEmptyArray } from 'camino-common/src/typescript-tools'
import { isEventWithTarget } from '../../utils/vue-tsx-utils'
import { HTMLAttributes } from 'vue'

export type Item<T> = { id: T; label: string }
export type Props<T, Items extends Readonly<NonEmptyArray<Item<T>>>> = {
  id?: string
  items: Items
  label: string
  labelVisible?: boolean
  selectedItemId: Items[number]['id'] | null
  placeholder?: string
  selectItem: (id: Items[number]['id'] | null) => void
} & HTMLAttributes

export const Dropdown = <T, Items extends Readonly<NonEmptyArray<Item<T>>>>(props: Props<T, Items>): JSX.Element => {
  const id = props.id ?? `select_${(Math.random() * 1000).toFixed()}`

  return (
    <span class="dsfr">
      <div class="fr-select-group">
        {props.labelVisible ?? true ? (
          <label class="fr-label" for={id}>
            {props.label}
          </label>
        ) : null}

        <select class="fr-select" id={id} aria-label={props.label} name={id} onChange={event => (isEventWithTarget(event) ? props.selectItem(event.target.value as T) : null)}>
          {props.items.map(({ id, label }) => (
            <option value={id} selected={props.selectedItemId === id}>
              {label}
            </option>
          ))}
          <option value="" selected={props.selectedItemId === null} disabled hidden>
            {props.placeholder ? props.placeholder : 'Selectionnez une option'}
          </option>
        </select>
      </div>
    </span>
  )
}
