import { computed, FunctionalComponent, HTMLAttributes, ref, watch } from 'vue'
import { Column, getSortColumnFromRoute, getSortOrderFromRoute, Table, TableRow } from './table'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { Range } from 'camino-common/src/number'
import { onBeforeRouteLeave, onBeforeRouteUpdate, RouteLocationNormalizedLoaded } from 'vue-router'
import { CaminoRouterLink, routerQueryToNumber } from '@/router/camino-router-link'

export interface Params {
  page?: number
  range?: Range
}
export interface Props {
  data: {
    columns: readonly Column[]
    rows: TableRow[]
    total: number
  }
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  caption: string
  updateParams: (params: { page: number; colonne: string; ordre: 'asc' | 'desc' }) => void
}

const getPageNumberFromRoute = (route: Pick<RouteLocationNormalizedLoaded, 'query'>) => routerQueryToNumber(route.query.page, 1)

export const TablePagination = caminoDefineComponent<Props>(['data', 'route', 'caption', 'updateParams'], props => {
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

  const colonne = ref<string>(getSortColumnFromRoute(props.route, props.data.columns))
  const ordre = ref<'asc' | 'desc'>(getSortOrderFromRoute(props.route))
  const pageNumber = computed<number>(() => getPageNumberFromRoute(props.route))

  const updateSort = (newColonne: string, newOrdre: 'asc' | 'desc') => {
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

  const pagination = computed<boolean>(() => {
    return props.data.total > props.data.rows.length
  })

  const totalNumberOfPages = computed<number>(() => {
    return Math.ceil(props.data.total / routerQueryToNumber(props.route.query.intervalle, 10))
  })

  return () => (
    <div class="dsfr">
      <Table route={props.route} caption={props.caption} columns={props.data.columns} rows={props.data.rows} updateParams={updateSort} />

      {pagination.value ? <Pagination route={props.route} totalNumberOfPages={totalNumberOfPages.value} /> : null}
    </div>
  )
})

interface PaginationProps {
  totalNumberOfPages: number
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
}

const Pagination: FunctionalComponent<PaginationProps> = props => {
  const visibles = 5

  const currentActivePageNumber = getPageNumberFromRoute(props.route)

  const start: number = Math.min(Math.max(1, currentActivePageNumber - 2), props.totalNumberOfPages - visibles)

  return (
    <nav role="navigation" class="fr-pagination" aria-label="Pagination">
      <ul class="fr-pagination__list">
        <li>
          <CaminoRouterLink
            isDisabled={currentActivePageNumber === 1}
            class="fr-pagination__link fr-pagination__link--first"
            to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: 1 } }}
            title="Première page"
          >
            Première page
          </CaminoRouterLink>
        </li>
        <li>
          <CaminoRouterLink
            isDisabled={currentActivePageNumber === 1}
            class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
            to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: currentActivePageNumber - 1 } }}
            title="Page précédente"
          >
            Page précédente
          </CaminoRouterLink>
        </li>
        <Page route={props.route} pageNumber={1} currentActivePage={currentActivePageNumber} />
        {start > 2 ? (
          <li>
            <a class="fr-pagination__link fr-displayed-lg"> … </a>
          </li>
        ) : null}

        {[...Array(visibles)]
          .map((_, index) => start + index)
          .filter(pageNumber => pageNumber !== props.totalNumberOfPages && pageNumber !== 1)
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
          <CaminoRouterLink
            isDisabled={currentActivePageNumber === props.totalNumberOfPages}
            class="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
            to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: currentActivePageNumber + 1 } }}
            title="Page suivante"
          >
            Page suivante
          </CaminoRouterLink>
        </li>
        <li>
          <CaminoRouterLink
            isDisabled={currentActivePageNumber === props.totalNumberOfPages}
            class="fr-pagination__link fr-pagination__link--last"
            to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: props.totalNumberOfPages } }}
            title="Dernière page"
          >
            Dernière page
          </CaminoRouterLink>
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
        to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: props.pageNumber } }}
        title={`Page ${props.pageNumber}`}
      >
        {props.pageNumber}
      </CaminoRouterLink>
    </li>
  )
}
