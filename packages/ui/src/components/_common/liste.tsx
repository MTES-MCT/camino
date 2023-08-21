import { TablePagination, getInitialParams } from '../_ui/table-pagination'
import { Filtres } from './filtres'
import { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { Column, TableRow } from '../_ui/table'
import { PageContentHeader, type Props as PageContentHeaderProps } from './page-header-content'
import { computed, defineComponent, onMounted, ref, Ref } from 'vue'
import { z } from 'zod'
import { getInitialFiltres } from '../_ui/filters/filters'
import { CaminoFiltres, caminoFiltres } from '../_ui/filters/camino-filtres'
import { ApiClient } from '../../api/api-client'
import { AsyncData } from '../../api/client-rest'

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
  getData: (params: Params<ColumnId>) => Promise<{ values: TableRow<ColumnId>[]; total: number }>
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
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
      getData(params.value)
    }
  }

  const tableData = ref<AsyncData<{ rows: TableRow[]; total: number }>>({ status: 'LOADING' })

  const getData = async (params: Params<ColumnId>) => {
    tableData.value = { status: 'LOADING' }
    try {
      const loaded = await props.getData(params)
      tableData.value = { status: 'LOADED', value: { rows: loaded.values, total: loaded.total } }
    } catch (e: any) {
      console.error('error', e)
      tableData.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }
  onMounted(async () => {
    await getData(params.value)
  })

  const paramsFiltresUpdate = (filtres: Params<ColumnId>['filtres']) => {
    if (JSON.stringify(params.value.filtres) !== JSON.stringify(filtres)) {
      params.value.filtres = filtres
      params.value.page = 1
      getData(params.value)
    }
  }

  const resultat = computed<string>(() => {
    if (tableData.value.status !== 'LOADED') {
      return '...'
    } else {
      const res = tableData.value.value.total > tableData.value.value.rows.length ? `${tableData.value.value.rows.length} / ${tableData.value.value.total}` : tableData.value.value.rows.length
      return `(${res} résultat${tableData.value.value.rows.length > 1 ? 's' : ''})`
    }
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

      <TablePagination data={tableData.value} columns={props.colonnes} caption={props.nom} route={props.route} updateParams={paramsTableUpdate} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Liste.props = ['colonnes', 'download', 'listeFiltre', 'nom', 'renderButton', 'route', 'updateUrlQuery', 'getData']
