import { TablePagination, getInitialParams } from '../_ui/table-pagination'
import { Filtres, Props as FiltresProps } from './filtres'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { Column, TableRow } from '../_ui/table'
import { PageContentHeader, type Props as PageContentHeaderProps } from './page-header-content'
import { computed, defineComponent, ref, Ref } from 'vue'
import { z } from 'zod'
import { FiltersDeclaration } from '../_ui/filters/all-filters'
import { getInitialFiltres } from '../_ui/filters/filters'
import { CaminoFiltres, caminoFiltres } from '../_ui/filters/camino-filtres'

export type Params<ColumnId extends string,> = {
  colonne: ColumnId
  ordre: 'asc' | 'desc'
  page: number
  filtres?: { [key in CaminoFiltres]: z.infer<typeof caminoFiltres[key]['validator']> }
}

type ListeFiltreProps = {
  filtres: readonly CaminoFiltres[]
  metas?: unknown
  initialized: boolean
}
type Props<ColumnId extends string> = {
  listeFiltre: ListeFiltreProps | null
  colonnes: readonly Column<ColumnId>[]
  lignes: TableRow[]
  total: number
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  paramsUpdate: (params: Params<ColumnId>) => void
} & PageContentHeaderProps

export const Liste = defineComponent(
  <ColumnId extends string>(
    props: Props<ColumnId>
  ) => {
    const initialParams = getInitialParams(props.route, props.colonnes)
    let initialFiltres = null
    if (props.listeFiltre) {
      initialFiltres = getInitialFiltres(props.route, props.listeFiltre?.filtres)
    }

    const params = ref<Params<ColumnId>>({
      ...initialParams,
      ...initialFiltres,
    }) as Ref<Params<ColumnId>>

    const paramsTableUpdate = (newParams: { page: number; colonne: ColumnId; ordre: 'asc' | 'desc' }) => {
      params.value.page = newParams.page
      params.value.colonne = newParams.colonne
      params.value.ordre = newParams.ordre
      props.paramsUpdate(params.value)
    }

    const paramsFiltresUpdate = (filtres: Params<ColumnId>['filtres']) => {
      params.value.filtres = filtres
      props.paramsUpdate(params.value)
    }

    const data = computed(() => ({
      columns: props.colonnes,
      rows: props.lignes,
      total: props.total,
    }))

    const res = props.total > props.lignes.length ? `${props.lignes.length} / ${props.total}` : props.lignes.length
    const resultat = `(${res} résultat${props.lignes.length > 1 ? 's' : ''})`

    return () => (
      <div class="fr-container">
        <PageContentHeader nom={props.nom} download={props.download} renderButton={props.renderButton} />

        {props.listeFiltre ? (
          <Filtres
            route={props.route}
            filters={props.listeFiltre.filtres}
            subtitle={resultat}
            initialized={props.listeFiltre.initialized}
            metas={props.listeFiltre.metas}
            paramsUpdate={paramsFiltresUpdate}
          />
        ) : null}

        <TablePagination data={data.value} caption={props.nom} route={props.route} updateParams={paramsTableUpdate} />
      </div>
    )
  }
)

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Liste.props = ['colonnes', 'download', 'lignes', 'listeFiltre', 'nom', 'paramsUpdate', 'renderButton', 'route', 'total']
