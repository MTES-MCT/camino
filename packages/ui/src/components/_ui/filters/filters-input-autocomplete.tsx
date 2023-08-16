import { computed, defineComponent } from 'vue'
import { TypeAheadSmartMultiple, Filter } from '../typeahead-smart-multiple'
import { AutocompleteCaminoFiltres, caminoAutocompleteFiltres, caminoFiltres } from './camino-filtres'

export type InputAutocompleteValues = (typeof caminoFiltres)[AutocompleteCaminoFiltres]['validator']['_output']
type Props = {
  filter: AutocompleteCaminoFiltres
  metas?: unknown
  initialValue: InputAutocompleteValues
  onFilterAutocomplete: (values: InputAutocompleteValues) => void
}

export const InputAutocomplete = defineComponent<Props>(props => {
  const filter = computed<(typeof caminoAutocompleteFiltres)[number]>(() => {
    return caminoFiltres[props.filter]
  })

  const filterFull = computed(() => {
    const filterFull: Filter<(typeof filter.value)['id']> = {
      ...filter.value,
      // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer)
      value: props.initialValue,
    }

    if ('elementsFormat' in filter.value) {
      filterFull.elements = filter.value.elementsFormat(filter.value.id, props.metas)
    }
    return filterFull
  })

  const onSelectItems = (items: { id: string }[]) => {
    // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer)
    props.onFilterAutocomplete(items.map(({ id }) => id))
  }

  return () => (
    <div class="mb">
      <h5>{filter.value.name}</h5>
      <hr class="mb-s" />
      <TypeAheadSmartMultiple filter={filterFull.value} onSelectItems={onSelectItems} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
InputAutocomplete.props = ['filter', 'metas', 'initialValue', 'onFilterAutocomplete']
