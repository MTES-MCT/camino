import { computed, defineComponent } from 'vue'
import { TypeAheadSmartMultiple, Filter } from '../typeahead-smart-multiple'
import { AutocompleteCaminoFiltres, caminoAutocompleteFiltres } from './camino-filtres'
import { Entreprise } from 'camino-common/src/entreprise'
import { ApiClient } from '../../../api/api-client'
import { TitreId } from 'camino-common/src/validators/titres'
import { caminoFiltres } from 'camino-common/src/filters'

export type InputAutocompleteValues = (typeof caminoFiltres)[AutocompleteCaminoFiltres]['validator']['_output']
type Props = {
  filter: AutocompleteCaminoFiltres
  initialValue: InputAutocompleteValues
  entreprises: Entreprise[]
  onFilterAutocomplete: (values: InputAutocompleteValues) => void
  apiClient: Pick<ApiClient, 'titresRechercherByNom' | 'getTitresByIds'>
}

export const InputAutocomplete = defineComponent<Props>(props => {
  const filter = computed<(typeof caminoAutocompleteFiltres)[number]>(() => {
    return caminoFiltres[props.filter]
  })
  const filterFull = computed(() => {
    const filterCopy = { ...filter.value }
    if (filterCopy.id === 'entreprisesIds') {
      filterCopy.elements = props.entreprises
    }

    const filterFull: Filter<(typeof filter.value)['id']> = {
      ...filterCopy,
      // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer)
      value: props.initialValue,
    }
    if (filterCopy.id === 'titresIds') {
      const filterTitresIds = filterFull as Filter<TitreId>
      if (filterTitresIds.lazy) {
        filterTitresIds.search = (value: string) => props.apiClient.titresRechercherByNom(value)
        filterTitresIds.load = async (value: TitreId[]) => {
          try {
            return await props.apiClient.getTitresByIds(value, 'filter-input-autocomplete')
          } catch (e) {
            console.error('error', e)

            return Promise.resolve({ elements: [] })
          }
        }
      }
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
InputAutocomplete.props = ['filter', 'entreprises', 'initialValue', 'onFilterAutocomplete', 'apiClient']
