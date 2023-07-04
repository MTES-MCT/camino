import { NonEmptyArray } from "camino-common/src/typescript-tools"
import { isEventWithTarget } from "../../utils/vue-tsx-utils"

export type Item<T> = {id: T, label: string}
export type Props <T, Items extends Readonly<NonEmptyArray<Item<T>>> > = {
  id?: string
  items: Items
  label: string
  selectedItemId: Items[number]['id']| null
  selectItem: (id: Items[number]['id'] | null) => void
}


export const Dropdown =  <T, Items extends Readonly<NonEmptyArray<Item<T>>>>(props: Props<T, Items>): JSX.Element => {
  const id = props.id ?? `select_${(Math.random() * 1000).toFixed()}`

  return (<span class="dsfr">
  <div class="fr-select-group">
  <label class="fr-label" for={id}>
    {props.label}
  </label>
  <select class="fr-select" id={id} name={id} onChange={(event) => isEventWithTarget(event) ? props.selectItem(event.target.value as T) : null}>
    {props.items.map(({id, label}) => <option value={id} selected={props.selectedItemId === id}>{label}</option>)}
    <option value="" selected={props.selectedItemId === null} disabled hidden>Selectionnez une option</option>
  </select>
</div>
</span>
  )
}
