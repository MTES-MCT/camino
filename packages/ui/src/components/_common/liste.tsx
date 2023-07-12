import { TablePagination, getInitialParams } from '../_ui/table-pagination'
import { Filtres, Props as FiltresProps, Filtre } from './filtres'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { Column, TableRow } from '../_ui/table'
import { PageContentHeader, type Props as PageContentHeaderProps } from './page-header-content'
import { computed, defineComponent, ref, Ref } from 'vue'

export type Params<ColumnId extends string, FiltreId extends string> = {
  colonne: ColumnId
  ordre: 'asc' | 'desc'
  page: number
  filtres: Record<FiltreId, string | string[] | undefined>
}

type ListeFiltreProps<FiltreId extends string> = {
  filtres: readonly Filtre<FiltreId>[]
  metas?: unknown
  filtresParam: Record<FiltreId, string | string[] | undefined>
  initialized: boolean
}
type Props<ColumnId extends string, FiltreId extends string> = {
  listeFiltre: ListeFiltreProps<FiltreId> | null
  colonnes: readonly Column<ColumnId>[]
  lignes: TableRow[]
  total: number
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  paramsUpdate: (params: Params<ColumnId, FiltreId>) => void
} & PageContentHeaderProps

export const Liste = defineComponent(<ColumnId extends string, FiltreId extends string>(props: Props<ColumnId, FiltreId>) => {
  const initialParams = getInitialParams(props.route, props.colonnes)

  // FIXME getInitialFiltres qui va lire le routeur
  const params = ref<Params<ColumnId, FiltreId>>({ ...initialParams, filtres: {} as Record<FiltreId, string | string[] | undefined> }) as Ref<Params<ColumnId, FiltreId>>

  const paramsTableUpdate = (newParams: { page: number; colonne: ColumnId; ordre: 'asc' | 'desc' }) => {
    params.value.page = newParams.page
    params.value.colonne = newParams.colonne
    params.value.ordre = newParams.ordre
    props.paramsUpdate(params.value)
  }

  const paramsFiltresUpdate = (filtres: Params<ColumnId, FiltreId>['filtres']) => {
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
          filtres={props.listeFiltre.filtres ?? []}
          subtitle={resultat}
          initialized={props.listeFiltre.initialized}
          metas={props.listeFiltre.metas}
          params={props.listeFiltre.filtresParam}
          paramsUpdate={paramsFiltresUpdate}
        />
      ) : null}

      <TablePagination data={data.value} caption={props.nom} route={props.route} updateParams={paramsTableUpdate} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Liste.props = ['colonnes', 'download', 'lignes', 'listeFiltre', 'nom', 'paramsUpdate', 'renderButton', 'route', 'total']
