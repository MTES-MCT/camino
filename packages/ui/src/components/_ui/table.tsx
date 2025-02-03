import { computed, defineComponent, watch } from 'vue'
import { CaminoRouterLink, routerQueryToString } from '@/router/camino-router-link'
import { onBeforeRouteLeave } from 'vue-router'
import { AsyncData } from '../../api/client-rest'
import { DemarcheIdOrSlug } from 'camino-common/src/demarche'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'
import type { JSX } from 'vue/jsx-runtime'
import { CaminoRouteLocation, CaminoRouteNames, CaminoVueRoute } from '@/router/routes'
import { fr } from '@codegouvfr/react-dsfr'
type SortOrder = 'asc' | 'desc'

export interface InitialSort<ColumnId> {
  colonne: ColumnId
  ordre: SortOrder
}
export interface JSXElementColumnData {
  type: 'jsx'
  jsxElement: JSX.Element
  value: string | string[] | number | undefined
}
export interface ComponentColumnData {
  type: 'component'
  component: unknown
  props: { [key in string]: unknown }
  class?: string
  value: string | string[] | number | undefined
}

export interface TextColumnData {
  type: 'text'
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
    [key in T]: JSXElementColumnData | ComponentColumnData | TextColumnData
  }
}

export interface Column<T = string> {
  id: T
  contentTitle: string | JSX.Element
  noSort?: boolean
  class?: string[]
}

type CommonProps<ColumnId extends string> = {
  columns: readonly Column<ColumnId>[]
  rows: AsyncData<{ rows: TableRow[]; total: number }>
  caption: {
    value: string
    visible: boolean
  }
}
type RouteProps<ColumnId extends string> = {
  sortType: 'route'
  route: CaminoRouteLocation
  updateParams: (column: ColumnId, order: 'asc' | 'desc') => void
}
type AutoSortProps = {
  sortType: 'noSort'
}

type Props<ColumnId extends string> = CommonProps<ColumnId> & (RouteProps<ColumnId> | AutoSortProps)

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
export const Table = defineComponent(<ColumnId extends string>(props: Props<ColumnId>) => {
  const sortParams = computed<InitialSort<ColumnId> | 'noSort'>(() => {
    return props.sortType === 'noSort' ? 'noSort' : { ordre: getSortOrderFromRoute(props.route), colonne: getSortColumnFromRoute<ColumnId>(props.route, props.columns) }
  })

  onBeforeRouteLeave(() => {
    stop()
  })

  const stop = watch(sortParams, (newSortParams, old) => {
    if (newSortParams !== 'noSort' && old !== 'noSort') {
      if ('updateParams' in props && (newSortParams.colonne !== old.colonne || newSortParams.ordre !== old.ordre)) {
        return props.updateParams(newSortParams.colonne, newSortParams.ordre)
      }
    }
  })

  const routeOrderClick = computed<CaminoVueRoute<CaminoRouteNames>>(() => {
    if (props.sortType === 'route' && sortParams.value !== 'noSort') {
      return {
        name: props.route.name,
        query: { ...props.route.query, page: 1, ordre: sortParams.value.ordre === 'asc' ? 'desc' : 'asc' },
        params: props.route.params,
      }
    }
    return { name: 'erreur', query: {}, params: {} }
  })

  const routeNewColumnClick = (colId: ColumnId): CaminoVueRoute<CaminoRouteNames> => {
    if (props.sortType === 'route' && sortParams.value !== 'noSort') {
      return {
        name: props.route.name,
        query: { ...props.route.query, page: 1, colonne: colId, ordre: sortParams.value.ordre === 'asc' ? 'desc' : 'asc' },
        params: props.route.params,
      }
    }
    return { name: 'erreur', query: {}, params: {} }
  }
  return () => (
    <div>
      <div class={[fr.cx('fr-table'), props.caption.visible ? null : fr.cx('fr-table--no-caption'), fr.cx('fr-table--no-scroll')]} style={{ overflow: 'auto' }}>
        <div class={[fr.cx('fr-table__wrapper')]} style={{ width: 'auto' }}>
          <div class={[fr.cx('fr-table__container')]}>
            <div class={[fr.cx('fr-table__content')]}>
              <table style={{ display: 'table', width: '100%' }}>
                <caption>{props.caption.value}</caption>
                <thead>
                  <tr>
                    {props.columns.map(col => (
                      <th key={col.id} scope="col" class={col.class}>
                        {(col.noSort !== undefined && col.noSort) || sortParams.value === 'noSort' ? (
                          col.contentTitle === '' ? (
                            '-'
                          ) : (
                            col.contentTitle
                          )
                        ) : sortParams.value.colonne === col.id ? (
                          <CaminoRouterLink
                            class={[fr.cx('fr-link'), fr.cx('fr-link--icon-right'), sortParams.value.ordre === 'asc' ? fr.cx('fr-icon-arrow-down-fill') : fr.cx('fr-icon-arrow-up-fill')]}
                            to={routeOrderClick.value}
                            isDisabled={false}
                            title={sortParams.value.ordre === 'asc' ? `Trier par la colonne ${col.contentTitle} par ordre descendant` : `Trier par la colonne ${col.contentTitle} par ordre ascendant`}
                          >
                            {col.contentTitle}
                          </CaminoRouterLink>
                        ) : (
                          <CaminoRouterLink class={[fr.cx('fr-link')]} isDisabled={false} to={routeNewColumnClick(col.id)} title={`Trier par la colonne ${col.contentTitle}`}>
                            {col.contentTitle === '' ? '-' : col.contentTitle}
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
                            <td key={col.id} class={col.class}>
                              {index === 0 && row.link !== null ? (
                                <router-link class={[fr.cx('fr-link')]} to={row.link}>
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
        </div>
      </div>
    </div>
  )
})
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Table.props = ['columns', 'rows', 'route', 'caption', 'updateParams', 'sortType', 'initialSort']

const DisplayColumn = (props: { data: JSXElementColumnData | ComponentColumnData | TextColumnData }): JSX.Element => {
  if (props.data.type === 'component') {
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
  } else if (props.data.type === 'jsx') {
    return props.data.jsxElement
  }

  return <span class={(props.data.class ?? []).join(' ') ?? ''}>{props.data.value}</span>
}
