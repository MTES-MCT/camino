import { computed, defineComponent, watch } from 'vue'
import { CaminoRouterLink, routerQueryToString } from '@/router/camino-router-link'
import { RouteLocationNormalizedLoaded, onBeforeRouteLeave } from 'vue-router'
import { AsyncData } from '../../api/client-rest'

type SortOrder = 'asc' | 'desc'

export interface TableSortEvent {
  column: string
  order: SortOrder
}

export interface InitialSort {
  column: string
  order: SortOrder
}

export interface ComponentColumnData {
  component: unknown
  props: { [key in string]: unknown }
  class?: string
  value: string | string[] | number | undefined
}

export interface TextColumnData {
  value: string
  class?: string[]
}

export interface TableRow<T extends string = string> {
  id: string
  link: {
    name: string
    params?: {
      id: string
    }
  }
  columns: {
    [key in T]: ComponentColumnData | TextColumnData
  }
}

export interface Column<T = string> {
  id: T
  name: string
  // FIXME deprecated, not used anymore?
  class?: string[]
  noSort?: boolean
  width?: string
}

export const isComponentColumnData = (columnRow: ComponentColumnData | TextColumnData): columnRow is ComponentColumnData => {
  return 'component' in columnRow
}

interface Props<ColumnId> {
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  columns: readonly Column<ColumnId>[]
  rows: AsyncData<{rows: TableRow[], total: number}>
  caption: string
  updateParams: (column: ColumnId, order: 'asc' | 'desc') => void
}

export const isColumnId = <ColumnId extends string>(columns: readonly Column<ColumnId>[], value: string): value is ColumnId => {
  return columns.some(({ id }) => value === id)
}

export const getSortColumnFromRoute = <ColumnId extends string>(route: Pick<RouteLocationNormalizedLoaded, 'query'>, columns: readonly Column<ColumnId>[]): ColumnId => {
  const value = routerQueryToString(route.query.colonne, columns[0].id)
  if (isColumnId(columns, value)) {
    return value
  } else {
    return columns[0].id
  }
}
export const getSortOrderFromRoute = (route: Pick<RouteLocationNormalizedLoaded, 'query'>): 'asc' | 'desc' => {
  const value = routerQueryToString(route.query.ordre, 'asc')
  if (value !== 'asc' && value !== 'desc') {
    return 'asc'
  }
  return value
}
export const Table = defineComponent(
  <ColumnId extends string>(props: Props<ColumnId>) => {
    const sortParams = computed<{ order: 'asc' | 'desc'; column: ColumnId }>(() => {
      return { order: getSortOrderFromRoute(props.route), column: getSortColumnFromRoute(props.route, props.columns) }
    })

    onBeforeRouteLeave(() => {
      stop()
    })

    const stop = watch(sortParams, (newSortParams, old) => {
      if (newSortParams.column !== old.column || newSortParams.order !== old.order) {
        return props.updateParams(newSortParams.column, newSortParams.order)
      }
    })

    return () => (
      <div class="dsfr">
        <div class="fr-table fr-table--no-caption">
          <table style={{ display: 'table', tableLayout: 'fixed', width: '100%' }}>
            <caption>{props.caption}</caption>
            <thead>
              <tr>
                {props.columns.map(col => (
                  <th style={{width: col.width ? col.width : 'auto'}} key={col.id} scope="col" class={[...(col.class ?? []), 'nowrap']}>
                    {col.noSort ? (
                      <CaminoRouterLink class={['fr-link']} isDisabled={true} title={col.name} to="">
                        {col.name === '' ? '-' : col.name}
                      </CaminoRouterLink>
                    ) : sortParams.value.column === col.id ? (
                      <CaminoRouterLink
                        class={['fr-link', 'fr-link--icon-right', sortParams.value.order === 'asc' ? 'fr-icon-arrow-down-fill' : 'fr-icon-arrow-up-fill']}
                        to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: 1, ordre: sortParams.value.order === 'asc' ? 'desc' : 'asc' } }}
                        title={sortParams.value.order === 'asc' ? `Trier par la colonne ${col.name} par ordre descendant` : `Trier par la colonne ${col.name} par ordre ascendant`}
                      >
                        {col.name}
                      </CaminoRouterLink>
                    ) : (
                      <CaminoRouterLink
                        class={['fr-link']}
                        to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: 1, colonne: col.id, ordre: 'asc' } }}
                        title={`Trier par la colonne ${col.name}`}
                      >
                        {col.name === '' ? '-' : col.name}
                      </CaminoRouterLink>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.rows.status === 'LOADED' ? <>{props.rows.value.rows.map(row => (
                <tr key={row.id}>
                  {props.columns.map((col, index) => (
                    <td key={col.id} class={[...(col.class ?? [])]}>
                      {index === 0 ? (
                        <router-link class="fr-link" to={row.link}>
                          <DisplayColumn data={row.columns[col.id]} />
                        </router-link>
                      ) : (
                        <DisplayColumn data={row.columns[col.id]} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}</> : [...Array(10).keys()].map(index => (<tr key={index}>
                {props.columns.map((col, index) => (
                  <td key={col.id}>...</td>
                ))}
              </tr>))
              }

            </tbody>
          </table>
        </div>
      </div>
    )
  },
  { props: ['columns', 'rows', 'route', 'caption', 'updateParams'] }
)

export const DisplayColumn = (props: { data: ComponentColumnData | TextColumnData }): JSX.Element => {
  if (isComponentColumnData(props.data)) {
    const myComp = props.data.component

    if (props.data.value) {
      return (
        <myComp {...props.data.props} class={props.data.class ?? ''}>
          {props.data.value}
        </myComp>
      )
    } else {
      return <myComp {...props.data.props} class={props.data.class ?? ''} />
    }
  }
  return <span class={(props.data.class ?? []).join(' ') ?? ''}>{props.data.value}</span>
}
