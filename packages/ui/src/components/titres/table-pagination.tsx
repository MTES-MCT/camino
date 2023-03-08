import { computed } from 'vue'
import { useStore } from 'vuex'
import { Params, TablePagination as UITablePagination } from '../_ui/table-pagination'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { TitreEntreprise, titresColonnes, titresLignesBuild } from './table-utils'
import { TableSortEvent } from '../_ui/table'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'

interface Props {
  titres: TitreEntreprise[]
  total: number
}

const isTableSortEvent = (params: Params | TableSortEvent): params is TableSortEvent => {
  return 'column' in params && 'order' in params
}

export const TablePagination = caminoDefineComponent<Props>(['titres', 'total'], props => {
  const store = useStore()

  const preferencesUpdate = (params: Params | TableSortEvent) => {
    // TODO 2023-03-01 better type this when we remove the store
    const newParams: any = { ...params }
    if (isTableSortEvent(params)) {
      if (params.column) {
        newParams.colonne = params.column
        delete newParams.column
      }
      if (params.order) {
        newParams.ordre = params.order
        delete newParams.order
      }
    } else {
      if (params.range) {
        newParams.intervalle = params.range
        delete newParams.range
      }
    }

    store.dispatch('titres/paramsSet', {
      section: 'table',
      params: newParams,
    })
  }

  const preferences = computed(() => {
    return store.state.titres.params.table
  })

  const activitesCol = computed(() => {
    const user = store.state.user.element

    return canReadActivites(user)
  })

  const colonnes = computed(() => {
    return titresColonnes.filter(({ id }) => (activitesCol.value ? true : id !== 'activites'))
  })

  const lignes = computed(() => {
    return titresLignesBuild(props.titres, activitesCol.value)
  })

  return () => (
    <UITablePagination
      column={preferences.value.colonne}
      columns={colonnes.value}
      order={preferences.value.ordre}
      page={preferences.value.page}
      range={preferences.value.intervalle}
      rows={lignes.value}
      total={props.total}
      paramsUpdate={preferencesUpdate}
    />
  )
})
