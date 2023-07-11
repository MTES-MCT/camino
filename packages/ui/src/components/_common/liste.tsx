import { TablePagination } from '../_ui/table-pagination'
import { Filtres, Props as FiltresProps } from './filtres'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { Column, TableRow } from '../_ui/table'
import { PageContentHeader, type Props as PageContentHeaderProps} from './page-header-content'

type ParamsFiltre = {
  section: 'filtres'
  // TODO 2023-07-11 type this correctly when refactoring filters
  params: any
}
type ParamsTable<ColumnId> = {
  section: 'table'
  params: { colonne: ColumnId; ordre: 'asc' | 'desc'; page: number }
}

type Params<ColumnId, ListeFiltre> =  keyof ListeFiltre extends never ? ParamsTable<ColumnId> : ParamsTable<ColumnId> | ParamsFiltre

type ListeFiltreProps = {
  filtres: FiltresProps['filtres']
  metas?: unknown
  filtresParam: Record<string, unknown>
  initialized: boolean
 }
type Props<ColumnId, ListeFiltre extends ListeFiltreProps | null, Toto  =  Params<ColumnId, ListeFiltre>
> = {
  listeFiltre: ListeFiltre
  colonnes: readonly Column<ColumnId>[]
  lignes: TableRow[]
  total: number
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  paramsUpdate: (params: Toto) => void
} & PageContentHeaderProps

// const isNotNullListe = <ColumnId, ListeFiltre extends ListeFiltreProps | null>(props: Props<ColumnId, ListeFiltre, Toto> ): props is (Omit<Props<ColumnId, ListeFiltre, Toto>, 'listeFiltre'> & {listeFiltre: NonNullable<Props<ColumnId, ListeFiltre, Toto>['listeFiltre']>})=> props.listeFiltre !== null


type tutu  = Params<'toto', null>
type tata  = Params<'toto', {filtres: {}}>

export const Liste = <ColumnId, ListeFiltre extends ListeFiltreProps | null>(props: Props<ColumnId, ListeFiltre>): JSX.Element => {
  const paramsTableUpdate = (newParams: { page: number; colonne: ColumnId; ordre: 'asc' | 'desc' }) => {
    props.paramsUpdate({ section: 'table', params: newParams })
  }

  const paramsFiltresUpdate = (params: any) => {
    // console.log(props.listeFiltre.initialized)
    const paramsUpdate = props.paramsUpdate
    if(props.listeFiltre){
      console.log(props.listeFiltre.initialized)
      paramsUpdate({
        section: 'filtres',
        params,
      })
    }
    // if (isNotNullListe(props)) {

    //   console.log(props.listeFiltre)
    //   props.paramsUpdate({
    //     section: 'filtres',
    //     params,
    //   })
    // }
  }

  const data = {
    columns: props.colonnes,
    rows: props.lignes,
    total: props.total,
  }

  const res = props.total > props.lignes.length ? `${props.lignes.length} / ${props.total}` : props.lignes.length
  const resultat = `(${res} résultat${props.lignes.length > 1 ? 's' : ''})`

  return (
    <div class="fr-container">
        <PageContentHeader nom={props.nom} download={props.download} renderButton={props.renderButton}/>


      {props.listeFiltre ? <Filtres filtres={props.listeFiltre.filtres ?? []} subtitle={resultat} initialized={props.listeFiltre.initialized} metas={props.listeFiltre.metas} params={props.listeFiltre.filtresParam} paramsUpdate={paramsFiltresUpdate} /> : null}


      <TablePagination data={data} caption={props.nom} route={props.route} updateParams={paramsTableUpdate} />
    </div>
  )
}


