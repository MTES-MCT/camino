import { FunctionalComponent } from 'vue'
import { TypeAheadSmartMultiple } from './typeahead-smart-multiple'
import { FilterAutocomplete, FilterComponentProp } from './all-filters'

type Props<T extends string> = {
  filter: FilterComponentProp<FilterAutocomplete<T>, never, never, T >
}

export const InputAutocomplete = <T extends string>(props: Props<T>): JSX.Element => (
  <div class="mb">
    <h5>{props.filter.name}</h5>
    <hr class="mb-s" />
    <TypeAheadSmartMultiple {...props} onSelectItems={() => ({})} />
  </div>
)
