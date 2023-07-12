import { TablePagination, getInitialParams } from '../_ui/table-pagination'
import { Filtres, Props as FiltresProps, Filtre } from './filtres'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { Column, TableRow } from '../_ui/table'
import { PageContentHeader, type Props as PageContentHeaderProps } from './page-header-content'
import { computed, defineComponent, ref, Ref } from 'vue'
import { ZodType, z } from 'zod'

export type Params<ColumnId extends string, FiltreId extends string, Validators extends Record<FiltreId, ZodType>> = {
  colonne: ColumnId
  ordre: 'asc' | 'desc'
  page: number
  filtres: { [key in FiltreId]: z.infer<Validators[key]> }
}

type ListeFiltreProps<FiltreId extends string, Validators extends Record<FiltreId, ZodType>> = {
  filtres: readonly Filtre<FiltreId>[]
  metas?: unknown
  validators: Validators
  filtresParam: { [key in FiltreId]: z.infer<Validators[key]> }
  initialized: boolean
}
type Props<ColumnId extends string, FiltreId extends string, Validators extends Record<FiltreId, ZodType>> = {
  listeFiltre: ListeFiltreProps<FiltreId, Validators> | null
  colonnes: readonly Column<ColumnId>[]
  lignes: TableRow[]
  total: number
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  paramsUpdate: (params: Params<ColumnId, FiltreId, Validators>) => void
} & PageContentHeaderProps

export const Liste = defineComponent(<ColumnId extends string, FiltreId extends string, Validators extends Record<FiltreId, ZodType>>(props: Props<ColumnId, FiltreId, Validators>) => {
  const initialParams = getInitialParams(props.route, props.colonnes)

  // FIXME getInitialFiltres qui va lire le routeur
  const params = ref<Params<ColumnId, FiltreId, Validators>>({ ...initialParams, filtres: {} as Record<FiltreId, z.infer<Validators[FiltreId]>> }) as Ref<Params<ColumnId, FiltreId, Validators>>

  const paramsTableUpdate = (newParams: { page: number; colonne: ColumnId; ordre: 'asc' | 'desc' }) => {
    params.value.page = newParams.page
    params.value.colonne = newParams.colonne
    params.value.ordre = newParams.ordre
    props.paramsUpdate(params.value)
  }

  const paramsFiltresUpdate = (filtres: Params<ColumnId, FiltreId, Validators>['filtres']) => {
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
          validators={props.listeFiltre.validators}
          paramsUpdate={paramsFiltresUpdate}
        />
      ) : null}

      <TablePagination data={data.value} caption={props.nom} route={props.route} updateParams={paramsTableUpdate} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Liste.props = ['colonnes', 'download', 'lignes', 'listeFiltre', 'nom', 'paramsUpdate', 'renderButton', 'route', 'total']
