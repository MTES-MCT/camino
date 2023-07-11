import { FunctionalComponent } from 'vue'
import { TablePagination } from '../_ui/table-pagination'
import Filtres from './filtres.vue'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { Column, TableRow } from '../_ui/table'

type ParamsFiltre = {
  section: 'filtres'
  // params: { noms: string; typesIds: AdministrationTypeId[] }
  params: unknown
}
type ParamsTable = {
  section: 'table'
  params: { colonne: string; ordre: 'asc' | 'desc' }
}

type Props = {
  nom: string
  filtres?: unknown[]
  colonnes: readonly Column[]
  lignes: TableRow[]
  elements: unknown[]
  initialized?: boolean
  metas?: unknown
  params: { filtres: unknown }
  total: number
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  renderButton?: () => JSX.Element
  renderDownloads?: () => JSX.Element
  paramsUpdate: (params: ParamsFiltre | ParamsTable) => void
}

export const Liste: FunctionalComponent<Props> = props => {
  const paramsTableUpdate = (newParams: { page: number; colonne: string; ordre: 'asc' | 'desc' }) => {
    props.paramsUpdate({ section: 'table', params: newParams })
  }

  const paramsFiltresUpdate = params => {
    props.paramsUpdate({
      section: 'filtres',
      params,
    })
  }

  const data = {
    columns: props.colonnes,
    rows: props.lignes,
    total: props.total,
  }

  const res = props.total > props.elements.length ? `${props.elements.length} / ${props.total}` : props.elements.length
  const resultat = `${res} résultat${props.elements.length > 1 ? 's' : ''}`

  return (
    <div>
      <div class="desktop-blobs">
        <div class="desktop-blob-2-3">
          <h1 class="mt-xs mb-m cap-first">{props.nom}</h1>
        </div>

        <div class="desktop-blob-1-3">{props.renderButton ? props.renderButton() : null}</div>
      </div>

      {props.filtres?.length ? <Filtres filtres={props.filtres} initialized={props.initialized} metas={props.metas} params={props.params.filtres} onParamsUpdate={paramsFiltresUpdate} /> : null}

      <div class="tablet-blobs tablet-flex-direction-reverse">
        <div class="tablet-blob-1-3 flex mb-s">{props.renderDownloads ? props.renderDownloads() : null}</div>

        <div class="tablet-blob-2-3 flex">
          <div class="py-m h5 bold mb-xs">{resultat}</div>
        </div>
      </div>

      <div class="line-neutral width-full" />

      <TablePagination data={data} caption={props.nom} route={props.route} updateParams={paramsTableUpdate} />
    </div>
  )
}
