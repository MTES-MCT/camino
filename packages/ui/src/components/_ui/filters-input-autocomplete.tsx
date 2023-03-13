import { FunctionalComponent } from 'vue'
import { TypeAheadSmartMultiple, Props } from './typeahead-smart-multiple'

export const InputAutocomplete: FunctionalComponent<Props<string>> = props => (
  <div class="mb">
    <h5>{props.filter.name}</h5>
    <hr class="mb-s" />
    <TypeAheadSmartMultiple {...props} />
  </div>
)
