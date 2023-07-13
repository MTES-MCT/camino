import { FilterComponentProp, FilterInput } from "./all-filters"

type Props = {
  filter: FilterComponentProp<FilterInput>
}

export function FiltersInput(props: Props) {
  return (
    <div class="mb">
      <h5>{props.filter.name}</h5>
      <hr class="mb-s" />

      <input v-model={props.filter.value} type="text" placeholder={props.filter.placeholder} class="p-s" />
    </div>
  )
}
