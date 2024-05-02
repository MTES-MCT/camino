import { computed, defineComponent, FunctionalComponent, HTMLAttributes, Ref, ref, watch } from 'vue'
import { Column, getSortColumnFromRoute, getSortOrderFromRoute, Table, TableRow } from './table'
import { onBeforeRouteLeave, RouteLocationNormalizedLoaded } from 'vue-router'
import { CaminoRouterLink, routerQueryToNumber } from '@/router/camino-router-link'
import { AsyncData } from '../../api/client-rest'
import { LoadingElement } from './functional-loader'

interface Props<ColumnId> {
  columns: readonly Column<ColumnId>[]
  data: AsyncData<{
    rows: TableRow[]
    total: number
  }>
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  caption: string
  updateParams: (params: { page: number; colonne: ColumnId; ordre: 'asc' | 'desc' }) => void
}

export const getInitialParams = <ColumnId extends string>(route: Pick<RouteLocationNormalizedLoaded, 'query'>, columns: readonly Column<ColumnId>[]) => {
  return {
    colonne: getSortColumnFromRoute(route, columns),
    page: getPageNumberFromRoute(route),
    ordre: getSortOrderFromRoute(route),
  }
}

const getPageNumberFromRoute = (route: Pick<RouteLocationNormalizedLoaded, 'query'>) => routerQueryToNumber(route.query.page, 1)
export const TablePagination = defineComponent(<ColumnId extends string>(props: Props<ColumnId>) => {
  watch(
    () => props.data,
    () => {
      // TODO 2023-07-06 si on met un ref sur la div, le scrollIntoView pète le layout des onglets... à retester plus tard
      const main = document.querySelector<HTMLElement>('main')
      if (main) {
        main.scrollIntoView(true)
      }
    }
  )

  const initParams = getInitialParams(props.route, props.columns)

  const colonne = ref<ColumnId>(initParams.colonne) as Ref<ColumnId>
  const ordre = ref<'asc' | 'desc'>(initParams.ordre)
  const pageNumber = computed<number>(() => getPageNumberFromRoute(props.route))

  const updateSort = (newColonne: ColumnId, newOrdre: 'asc' | 'desc') => {
    ordre.value = newOrdre
    colonne.value = newColonne
    props.updateParams({ page: pageNumber.value, colonne: colonne.value, ordre: ordre.value })
  }

  onBeforeRouteLeave(() => {
    stop()
  })

  const stop = watch(pageNumber, newPageNumber => {
    props.updateParams({ page: newPageNumber, colonne: colonne.value, ordre: ordre.value })
  })

  const totalNumberOfPages = (total: number) => {
    return Math.ceil(total / routerQueryToNumber(props.route.query.intervalle, 10))
  }

  return () => (
    <div class="dsfr">
      <Table route={props.route} caption={props.caption} columns={props.columns} rows={props.data} updateParams={updateSort} />

      <LoadingElement data={props.data} renderItem={item => <>{item.total > item.rows.length ? <Pagination route={props.route} totalNumberOfPages={totalNumberOfPages(item.total)} /> : null}</>} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TablePagination.props = ['data', 'route', 'caption', 'updateParams', 'columns']

interface PaginationProps {
  totalNumberOfPages: number
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
}

const Pagination: FunctionalComponent<PaginationProps> = props => {
  const maxVisibles = 5
  const visibles = Math.min(maxVisibles, props.totalNumberOfPages)

  const currentActivePageNumber = getPageNumberFromRoute(props.route)

  const start: number = Math.max(1, currentActivePageNumber - 2)

  return (
    <nav role="navigation" class="fr-pagination" aria-label="Pagination">
      <ul class="fr-pagination__list">
        <li>
          {currentActivePageNumber === 1 ? (
            <CaminoRouterLink isDisabled={true} class="fr-pagination__link fr-pagination__link--first" to="" title="Première page">
              Première page
            </CaminoRouterLink>
          ) : (
            <CaminoRouterLink
              isDisabled={false}
              class="fr-pagination__link fr-pagination__link--first"
              to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: 1 } }}
              title="Première page"
            >
              Première page
            </CaminoRouterLink>
          )}
        </li>
        <li>
          {currentActivePageNumber === 1 ? (
            <CaminoRouterLink isDisabled={true} class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label" to="" title="Page précédente">
              Page précédente
            </CaminoRouterLink>
          ) : (
            <CaminoRouterLink
              isDisabled={false}
              class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
              to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: currentActivePageNumber - 1 } }}
              title="Page précédente"
            >
              Page précédente
            </CaminoRouterLink>
          )}
        </li>
        <Page route={props.route} pageNumber={1} currentActivePage={currentActivePageNumber} />
        {start > 2 ? (
          <li>
            <a class="fr-pagination__link fr-displayed-lg"> … </a>
          </li>
        ) : null}

        {[...Array(visibles)]
          .map((_, index) => start + index)
          .filter(pageNumber => pageNumber < props.totalNumberOfPages && pageNumber !== 1)
          .map(currentPageNumber => (
            <Page route={props.route} pageNumber={currentPageNumber} currentActivePage={currentActivePageNumber} />
          ))}
        {start < props.totalNumberOfPages - visibles ? (
          <li>
            <a class="fr-pagination__link fr-displayed-lg"> … </a>
          </li>
        ) : null}

        <Page route={props.route} pageNumber={props.totalNumberOfPages} currentActivePage={currentActivePageNumber} />
        <li>
          {currentActivePageNumber === props.totalNumberOfPages ? (
            <CaminoRouterLink isDisabled={true} class="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label" to="" title="Page suivante">
              Page suivante
            </CaminoRouterLink>
          ) : (
            <CaminoRouterLink
              isDisabled={false}
              class="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
              to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: currentActivePageNumber + 1 } }}
              title="Page suivante"
            >
              Page suivante
            </CaminoRouterLink>
          )}
        </li>
        <li>
          {currentActivePageNumber === props.totalNumberOfPages ? (
            <CaminoRouterLink isDisabled={true} class="fr-pagination__link fr-pagination__link--last" to="" title="Dernière page">
              Dernière page
            </CaminoRouterLink>
          ) : (
            <CaminoRouterLink
              isDisabled={false}
              class="fr-pagination__link fr-pagination__link--last"
              to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: props.totalNumberOfPages } }}
              title="Dernière page"
            >
              Dernière page
            </CaminoRouterLink>
          )}
        </li>
      </ul>
    </nav>
  )
}

interface PageProps {
  pageNumber: number
  currentActivePage: number
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
}
const Page: FunctionalComponent<PageProps> = (props: PageProps) => {
  const ariaProps: Pick<HTMLAttributes, 'aria-current'> = {}
  if (props.pageNumber === props.currentActivePage) {
    ariaProps['aria-current'] = 'page'
  }

  return (
    <li>
      <CaminoRouterLink
        class="fr-pagination__link"
        {...ariaProps}
        isDisabled={false}
        to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: props.pageNumber } }}
        title={`Page ${props.pageNumber}`}
      >
        {props.pageNumber}
      </CaminoRouterLink>
    </li>
  )
}
