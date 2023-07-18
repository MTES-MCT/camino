import { FunctionalComponent } from 'vue'
import { TypeAheadSmartMultiple } from '../typeahead-smart-multiple'
import { AutocompleteCaminoFiltres, caminoFiltres } from './camino-filtres'

type Props = {
  filter: AutocompleteCaminoFiltres
  metas?: unknown
  initialValue: (typeof caminoFiltres)[AutocompleteCaminoFiltres]['validator']['_output']
  onFilterAutocomplete: (values: (typeof caminoFiltres)[AutocompleteCaminoFiltres]['validator']['_output']) => void
}

export const InputAutocomplete: FunctionalComponent<Props> = (props): JSX.Element => {
  const filter = caminoFiltres[props.filter]
  let elements = []
  if ('elementsFormat' in filter) {
    elements = filter.elementsFormat(filter.id, props.metas)
  }
  return (
    <div class="mb">
      <h5>{filter.name}</h5>
      <hr class="mb-s" />
      <TypeAheadSmartMultiple
        filter={{
          elements,
          ...filter,
          // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer)
          value: props.initialValue,
        }}
        onSelectItems={items => {
          // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer)
          props.onFilterAutocomplete(items.map(({ id }) => id))
        }}
      />
    </div>
  )
}
