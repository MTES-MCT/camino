import { FunctionalComponent } from 'vue'
import { TypeAheadSmartMultiple } from '../typeahead-smart-multiple'
import { FilterAutocomplete, FilterComponentProp } from './all-filters'
import { AutocompleteCaminoFiltres, caminoFiltres } from './camino-filtres'

type Props = {
  filter: AutocompleteCaminoFiltres
  initialValue: typeof caminoFiltres[AutocompleteCaminoFiltres]['validator']['_output']
  onFilterAutocomplete: (values: typeof caminoFiltres[AutocompleteCaminoFiltres]['validator']['_output']) => void
}

export const InputAutocomplete = (props: Props): JSX.Element => {
  const filter = caminoFiltres[props.filter]
  return (
  <div class="mb">
    <h5>{filter.name}</h5>
    <hr class="mb-s" />
    <TypeAheadSmartMultiple filter={{...filter, value: props.initialValue}} onSelectItems={(items) => props.onFilterAutocomplete(items.map(({id}) => id))} />
  </div>
)}
