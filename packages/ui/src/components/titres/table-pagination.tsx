import { computed } from 'vue'
import { TablePagination, getInitialParams } from '../_ui/table-pagination'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { titresColonnes, titresLignesBuild } from './table-utils'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { TitreEntreprise } from 'camino-common/src/entreprise'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { User } from 'camino-common/src/roles'
import { TitreForTable } from '../titre/titre-api-client'

export type Params = { page: number; colonne: (typeof titresColonnes)[number]['id']; ordre: 'asc' | 'desc' }
export interface Props {
  titres: TitreForTable[]
  total: number
  user: User
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateParams: (params: Params) => void
}
export const getInitialTitresTablePaginationParams = (route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>) => {
  return getInitialParams(route, titresColonnes)
}
export const TitresTablePagination = caminoDefineComponent<Props>(['titres', 'total', 'updateParams', 'user', 'route'], props => {
  const activitesCol = computed(() => {
    return canReadActivites(props.user)
  })

  const colonnes = computed(() => {
    return titresColonnes.filter(({ id }) => (activitesCol.value ? true : id !== 'activites'))
  })

  const lignes = computed(() => {
    return titresLignesBuild(props.titres, activitesCol.value)
  })

  return () => (
    <TablePagination
      route={props.route}
      data={{
        columns: colonnes.value,
        rows: lignes.value,
        total: props.total,
      }}
      updateParams={props.updateParams}
      caption="Tableau des titres"
    />
  )
})
