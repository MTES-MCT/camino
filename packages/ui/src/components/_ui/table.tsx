import { computed, defineComponent, watch } from 'vue'
import { CaminoRouterLink, routerQueryToString } from '@/router/camino-router-link'
import { onBeforeRouteLeave } from 'vue-router'
import { AsyncData } from '../../api/client-rest'
import { DemarcheIdOrSlug } from 'camino-common/src/demarche'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'
import type { JSX } from 'vue/jsx-runtime'
import { CaminoRouteLocation } from '@/router/routes'
type SortOrder = 'asc' | 'desc'

export interface TableSortEvent {
  colonne: string
  ordre: SortOrder
}

// TODO 2023-12-06 merge with TableSortEvent
export interface InitialSort {
  colonne: string
  ordre: SortOrder
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

type TableRouterLink = {
  name: string
  params?: {
    id?: string
    activiteId?: string
    demarcheId?: DemarcheIdOrSlug
  }
}
export interface TableRow<T extends string = string> {
  id: string
  class?: NonEmptyArray<string>
  link: TableRouterLink | null
  columns: {
    [key in T]: ComponentColumnData | TextColumnData
  }
}

export interface Column<T = string> {
  id: T
  name: string
  noSort?: boolean
}

const isComponentColumnData = (columnRow: ComponentColumnData | TextColumnData): columnRow is ComponentColumnData => {
  return 'component' in columnRow
}

interface Props<ColumnId> {
  route: CaminoRouteLocation
  columns: readonly Column<ColumnId>[]
  rows: AsyncData<{ rows: TableRow[]; total: number }>
  caption: string
  updateParams: (column: ColumnId, order: 'asc' | 'desc') => void
}

const isColumnId = <ColumnId extends string>(columns: readonly Column<ColumnId>[], value: string): value is ColumnId => {
  return columns.some(({ id }) => value === id)
}

export const getSortColumnFromRoute = <ColumnId extends string>(route: Pick<CaminoRouteLocation, 'query'>, columns: readonly Column<ColumnId>[]): ColumnId => {
  const value = routerQueryToString(route.query.colonne, columns[0].id)
  if (isColumnId(columns, value)) {
    return value
  } else {
    return columns[0].id
  }
}
export const getSortOrderFromRoute = (route: Pick<CaminoRouteLocation, 'query'>): 'asc' | 'desc' => {
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
      <div>
        <div class="fr-table fr-table--no-caption" style={{ overflow: 'auto' }}>
          <table style={{ display: 'table', minWidth: '100%' }}>
            <caption>{props.caption}</caption>
            <thead>
              <tr>
                {props.columns.map(col => (
                  <th key={col.id} scope="col" class="nowrap">
                    {col.noSort !== undefined && col.noSort ? (
                      <div class="fr-text--md">{col.name === '' ? '-' : col.name}</div>
                    ) : sortParams.value.column === col.id ? (
                      <CaminoRouterLink
                        class={['fr-link', 'fr-link--icon-right', sortParams.value.order === 'asc' ? 'fr-icon-arrow-down-fill' : 'fr-icon-arrow-up-fill']}
                        to={{
                          name: props.route.name ?? undefined,
                          query: { ...props.route.query, page: 1, ordre: sortParams.value.order === 'asc' ? 'desc' : 'asc' },
                          params: props.route.params,
                        }}
                        isDisabled={false}
                        title={sortParams.value.order === 'asc' ? `Trier par la colonne ${col.name} par ordre descendant` : `Trier par la colonne ${col.name} par ordre ascendant`}
                      >
                        {col.name}
                      </CaminoRouterLink>
                    ) : (
                      <CaminoRouterLink
                        class={['fr-link']}
                        isDisabled={false}
                        to={{
                          name: props.route.name ?? undefined,
                          query: { ...props.route.query, page: 1, colonne: col.id, ordre: 'asc' },
                          params: props.route.params,
                        }}
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
              {props.rows.status === 'LOADED' ? (
                <>
                  {props.rows.value.rows.map(row => (
                    <tr key={row.id} class={row.class}>
                      {props.columns.map((col, index) => (
                        <td key={col.id}>
                          {index === 0 && row.link !== null ? (
                            <router-link class="fr-link" to={row.link}>
                              <DisplayColumn data={row.columns[col.id]} />
                            </router-link>
                          ) : (
                            <DisplayColumn data={row.columns[col.id]} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : (
                [...Array(10).keys()].map(index => (
                  <tr key={index}>
                    {props.columns.map((col, _index) => (
                      <td key={col.id}>...</td>
                    ))}
                  </tr>
                ))
              )}
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
    // @ts-ignore 2024-09-12 typescript ne voit pas que le composant est utilisé juste en dessous dans le TSX, mais ça fonctionne quand même...
    const myComp = props.data.component

    if (props.data.value !== undefined) {
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
