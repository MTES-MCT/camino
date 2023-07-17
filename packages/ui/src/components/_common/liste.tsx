import { TablePagination, getInitialParams } from '../_ui/table-pagination'
import { Filtres, Props as FiltresProps } from './filtres'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { Column, TableRow } from '../_ui/table'
import { PageContentHeader, type Props as PageContentHeaderProps } from './page-header-content'
import { computed, defineComponent, ref, Ref } from 'vue'
import { z } from 'zod'
import { FiltersDeclaration } from '../_ui/all-filters'

export type Params<
  ColumnId extends string,
  FiltreId extends string,
  SelectElement extends { id: SelectElementId },
  SelectElementId extends string,
  AutocompleteElementId extends string,
  Filtres extends { [key in FiltreId]: FiltersDeclaration<FiltreId, SelectElement, SelectElementId, AutocompleteElementId> }
> = {
  colonne: ColumnId
  ordre: 'asc' | 'desc'
  page: number
  filtres: { [key in FiltreId]: z.infer<Filtres[key]['validator']> }
}

type ListeFiltreProps<
  FiltreId extends string,
  SelectElement extends { id: SelectElementId },
  SelectElementId extends string,
  AutocompleteElementId extends string,
  Filtres extends { [key in FiltreId]: FiltersDeclaration<key, SelectElement, SelectElementId, AutocompleteElementId> }
> = {
  filtres: Filtres
  metas?: FiltresProps<FiltreId, SelectElement, SelectElementId, AutocompleteElementId, Filtres>['metas']
  filtresParam: FiltresProps<FiltreId, SelectElement, SelectElementId, AutocompleteElementId, Filtres>['params']
  initialized: boolean
}
type Props<
  ColumnId extends string,
  FiltreId extends string,
  SelectElement extends { id: SelectElementId },
  SelectElementId extends string,
  AutocompleteElementId extends string,
  Filtres extends { [key in FiltreId]: FiltersDeclaration<key, SelectElement, SelectElementId, AutocompleteElementId> }
> = {
  listeFiltre: ListeFiltreProps<FiltreId, SelectElement, SelectElementId, AutocompleteElementId, Filtres> | null
  colonnes: readonly Column<ColumnId>[]
  lignes: TableRow[]
  total: number
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  paramsUpdate: (params: Params<ColumnId, FiltreId, SelectElement, SelectElementId, AutocompleteElementId, Filtres>) => void
} & PageContentHeaderProps

export const Liste = defineComponent(
  <
    ColumnId extends string,
    FiltreId extends string,
    SelectElement extends { id: SelectElementId },
    SelectElementId extends string,
    AutocompleteElementId extends string,
    Filtres extends { [key in FiltreId]: FiltersDeclaration<key, SelectElement, SelectElementId, AutocompleteElementId> }
  >(
    props: Props<ColumnId, FiltreId, SelectElement, SelectElementId, AutocompleteElementId, Filtres>
  ) => {
    const initialParams = getInitialParams(props.route, props.colonnes)

    // FIXME getInitialFiltres qui va lire le routeur
    const params = ref<Params<ColumnId, FiltreId, SelectElement, SelectElementId, AutocompleteElementId, Filtres>>({
      ...initialParams,
      filtres: {} as { [key in FiltreId]: z.infer<Filtres[key]['validator']> },
    }) as Ref<Params<ColumnId, FiltreId, SelectElement, SelectElementId, AutocompleteElementId, Filtres>>

    const paramsTableUpdate = (newParams: { page: number; colonne: ColumnId; ordre: 'asc' | 'desc' }) => {
      params.value.page = newParams.page
      params.value.colonne = newParams.colonne
      params.value.ordre = newParams.ordre
      props.paramsUpdate(params.value)
    }

    const paramsFiltresUpdate = (filtres: Params<ColumnId, FiltreId, SelectElement, SelectElementId, AutocompleteElementId, Filtres>['filtres']) => {
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
            // @ts-ignore TODO 2023-07-13 pourquoi ?
            filtres={props.listeFiltre.filtres}
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
  }
)

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Liste.props = ['colonnes', 'download', 'lignes', 'listeFiltre', 'nom', 'paramsUpdate', 'renderButton', 'route', 'total']
