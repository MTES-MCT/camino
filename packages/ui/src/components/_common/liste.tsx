import { TablePagination, getInitialParams } from '../_ui/table-pagination'
import { Filtres } from './filtres'
import { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { Column, TableRow } from '../_ui/table'
import { PageContentHeader, type Props as PageContentHeaderProps } from './page-header-content'
import { computed, defineComponent, ref, Ref } from 'vue'
import { z } from 'zod'
import { getInitialFiltres } from '../_ui/filters/filters'
import { CaminoFiltres, caminoFiltres } from '../_ui/filters/camino-filtres'
import { ApiClient } from '../../api/api-client'

export type Params<ColumnId extends string> = {
  colonne: ColumnId
  ordre: 'asc' | 'desc'
  page: number
  filtres?: { [key in CaminoFiltres]: z.infer<(typeof caminoFiltres)[key]['validator']> }
}

type ListeFiltreProps = {
  filtres: readonly CaminoFiltres[]
  updateUrlQuery: Pick<Router, 'push'>
  apiClient: Pick<ApiClient, 'getUtilisateurEntreprises' | 'titresRechercherByNom' | 'getTitresByIds'>
}
type Props<ColumnId extends string> = {
  listeFiltre: ListeFiltreProps | null
  colonnes: readonly Column<ColumnId>[]
  lignes: TableRow[]
  total: number
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  paramsUpdate: (params: Params<ColumnId>) => void
} & PageContentHeaderProps

// FIXME tests
export const Liste = defineComponent(<ColumnId extends string>(props: Props<ColumnId>) => {
  const initialParams = getInitialParams(props.route, props.colonnes)
  const params = ref<Params<ColumnId>>({
    ...initialParams,
  }) as Ref<Params<ColumnId>>

  if (props.listeFiltre) {
    params.value.filtres = getInitialFiltres(props.route, props.listeFiltre?.filtres)
  }

  const paramsTableUpdate = (newParams: { page: number; colonne: ColumnId; ordre: 'asc' | 'desc' }) => {
    if (newParams.page !== params.value.page || newParams.colonne !== params.value.colonne || newParams.ordre !== params.value.ordre) {
      params.value.page = newParams.page
      params.value.colonne = newParams.colonne
      params.value.ordre = newParams.ordre
      props.paramsUpdate(params.value)
    }
  }

  const paramsFiltresUpdate = (filtres: Params<ColumnId>['filtres']) => {
    if (JSON.stringify(params.value.filtres) !== JSON.stringify(filtres)) {
      params.value.filtres = filtres
      params.value.page = 1
      props.paramsUpdate(params.value)
    }
  }

  const data = computed(() => ({
    columns: props.colonnes,
    rows: props.lignes,
    total: props.total,
  }))

  const resultat = computed<string>(() => {
    const res = props.total > props.lignes.length ? `${props.lignes.length} / ${props.total}` : props.lignes.length
    return `(${res} résultat${props.lignes.length > 1 ? 's' : ''})`
  })

  return () => (
    <div class="fr-container">
      <div class="dsfr">
        <PageContentHeader nom={props.nom} download={props.download} renderButton={props.renderButton} />
      </div>
      {props.listeFiltre ? (
        <Filtres
          updateUrlQuery={props.listeFiltre.updateUrlQuery}
          route={props.route}
          filters={props.listeFiltre.filtres}
          subtitle={resultat.value}
          apiClient={props.listeFiltre.apiClient}
          paramsUpdate={paramsFiltresUpdate}
        />
      ) : null}

      <TablePagination data={data.value} caption={props.nom} route={props.route} updateParams={paramsTableUpdate} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Liste.props = ['colonnes', 'download', 'lignes', 'listeFiltre', 'nom', 'paramsUpdate', 'renderButton', 'route', 'updateUrlQuery', 'total']
