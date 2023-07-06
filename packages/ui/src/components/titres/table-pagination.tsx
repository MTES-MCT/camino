import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { TablePagination } from '../_ui/table-pagination'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { titresColonnes, titresLignesBuild } from './table-utils'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { TitreEntreprise } from 'camino-common/src/entreprise'
import { useRoute } from 'vue-router'
import { routerQueryToNumber, routerQueryToString } from '@/router/camino-router-link'

interface Props {
  titres: TitreEntreprise[]
  total: number
}

export const TitresTablePagination = caminoDefineComponent<Props>(['titres', 'total'], props => {
  const store = useStore()
  const route = useRoute()

  const routeName = route.name

  watch(route, newRoute => {
    if (newRoute.name === routeName) {
      store.dispatch('titres/paramsSet', {
        section: 'table',
        params: {
          page: routerQueryToNumber(newRoute.query.page, 1),
          colonne: routerQueryToString(newRoute.query.colonne, colonnes.value[0].id),
          ordre: routerQueryToString(newRoute.query.ordre, 'asc'),
        },
      })
    }
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
    <TablePagination
      route={route}
      data={{
        columns: colonnes.value,
        rows: lignes.value,
        total: props.total,
      }}
      caption="Tableau des titres"
    />
  )
})
