import { computed, defineComponent, onMounted, ref } from 'vue'
import { TypeAheadSmartMultiple, Filter } from '../typeahead-smart-multiple'
import { AutocompleteCaminoFiltres, caminoAutocompleteFiltres, caminoFiltres } from './camino-filtres'
import { AsyncData } from '../../../api/client-rest'
import { Entreprise } from 'camino-common/src/entreprise'
import { LoadingElement } from '../functional-loader'
import { ApiClient } from '../../../api/api-client'
import { TitreId } from 'camino-common/src/titres'

export type InputAutocompleteValues = (typeof caminoFiltres)[AutocompleteCaminoFiltres]['validator']['_output']
type Props = {
  filter: AutocompleteCaminoFiltres
  initialValue: InputAutocompleteValues
  onFilterAutocomplete: (values: InputAutocompleteValues) => void
  apiClient: Pick<ApiClient, 'getUtilisateurEntreprises' | 'titresRechercherByNom' | 'getTitresByIds'>
}

export const InputAutocomplete = defineComponent<Props>(props => {
  const filter = computed<(typeof caminoAutocompleteFiltres)[number]>(() => {
    return caminoFiltres[props.filter]
  })
  const entreprisesMetasAsync = ref<AsyncData<Entreprise[]>>({ status: 'LOADING' })

  onMounted(async () => {
    if (props.filter === 'entreprisesIds') {
      entreprisesMetasAsync.value = { status: 'LOADING' }
      try {
        const entreprises = await props.apiClient.getUtilisateurEntreprises()
        entreprisesMetasAsync.value = { status: 'LOADED', value: entreprises }
      } catch (e: any) {
        console.error('error', e)
        entreprisesMetasAsync.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    } else {
      entreprisesMetasAsync.value = { status: 'LOADED', value: [] }
    }
  })

  const filterFull = (items: Entreprise[]) => {
    const filterCopy = { ...filter.value }
    if (filterCopy.id === 'entreprisesIds') {
      filterCopy.elements = items
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
        filterTitresIds.load = (value: TitreId[]) => props.apiClient.getTitresByIds(value)
      }
    }

    return filterFull
  }

  const onSelectItems = (items: { id: string }[]) => {
    // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer)
    props.onFilterAutocomplete(items.map(({ id }) => id))
  }

  return () => (
    <div class="mb">
      <h5>{filter.value.name}</h5>
      <hr class="mb-s" />
      <LoadingElement data={entreprisesMetasAsync.value} renderItem={item => <TypeAheadSmartMultiple filter={filterFull(item)} onSelectItems={onSelectItems} />} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
InputAutocomplete.props = ['filter', 'initialValue', 'onFilterAutocomplete', 'apiClient']
