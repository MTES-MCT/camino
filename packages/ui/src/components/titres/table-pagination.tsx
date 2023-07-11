import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { TablePagination } from '../_ui/table-pagination'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { titresColonnes, titresLignesBuild } from './table-utils'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { TitreEntreprise } from 'camino-common/src/entreprise'
import { useRoute } from 'vue-router'

interface Props {
  titres: TitreEntreprise[]
  total: number
}

export const TitresTablePagination = caminoDefineComponent<Props>(['titres', 'total'], props => {
  const store = useStore()
  const route = useRoute()

  const updateParams = (params: { page: number; colonne: string; ordre: 'asc' | 'desc' }) => {
    store.dispatch('titres/paramsSet', {
      section: 'table',
      params,
    })
  }

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
      updateParams={updateParams}
      caption="Tableau des titres"
    />
  )
})
