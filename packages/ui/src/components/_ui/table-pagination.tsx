import { computed, defineComponent, FunctionalComponent, HTMLAttributes } from 'vue'
import { Column, Table, TableRow, TableSortEvent } from './table'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { Range } from 'camino-common/src/number'
import { RouteLocationNormalizedLoaded, RouterLink, RouterLinkProps, useLink, UseLinkOptions } from 'vue-router'

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
  route: RouteLocationNormalizedLoaded
  caption: string
  column?: string
  order?: 'asc' | 'desc'
  paramsUpdate: (params: Params | TableSortEvent) => void
}

export const TablePagination = caminoDefineComponent<Props>(['data', 'column', 'order', 'route', 'paramsUpdate', 'caption'], props => {
  const update = (params: Params | TableSortEvent) => {
    if (!Object.keys(params).includes('page') && pagination.value) {
      Object.assign(params, { page: 1 })
    }

    props.paramsUpdate(params)
  }

  const pageUpdate = (page: number) => {
    update({ page })
  }

  const pageNumber = computed<number>(() => {
    return Number(props.route.query.page) ?? 1
  })

  const column = computed(() => {
    return props.column ?? ''
  })

  const order = computed<'asc' | 'desc'>(() => {
    return props.order ?? 'asc'
  })

  const pagination = computed<boolean>(() => {
    return props.data.total > props.data.rows.length
  })

  const totalNumberOfPages = computed<number>(() => {
    return Math.ceil(props.data.total / (Number(props.route.query.intervalle) ?? 10))
  })

  return () => (
    <div class="dsfr">
      <Table column={column.value} caption={props.caption} columns={props.data.columns} order={order.value} rows={props.data.rows} update={update} />

      {pagination.value ? <Pagination route={props.route} pageNumber={pageNumber.value} totalNumberOfPages={totalNumberOfPages.value} pageChange={pageUpdate} /> : null}
    </div>
  )
})

interface PaginationProps {
  totalNumberOfPages: number
  pageNumber: number
  pageChange: (page: number) => void
  route: RouteLocationNormalizedLoaded
}

const Pagination: FunctionalComponent<PaginationProps> = props => {
  const visibles = 5

  const start: number = Math.min(Math.max(1, props.pageNumber - 2), props.totalNumberOfPages - visibles)

  return (
    <nav role="navigation" class="fr-pagination" aria-label="Pagination">
      <ul class="fr-pagination__list">
        <li>
          <a class="fr-pagination__link fr-pagination__link--first" aria-disabled={props.pageNumber === 1} role="link">
            Première page
          </a>
        </li>
        <li>
          <a class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label" aria-disabled={props.pageNumber === 1} role="link">
            Page précédente
          </a>
        </li>
        <Page route={props.route} pageNumber={1} currentActivePage={props.pageNumber} />
        {start > 2 ? (
          <li>
            <a class="fr-pagination__link fr-displayed-lg"> … </a>
          </li>
        ) : null}

        {[...Array(visibles)]
          .map((_, index) => start + index)
          .filter(pageNumber => pageNumber !== props.totalNumberOfPages && pageNumber !== 1)
          .map(pageNumber => (
            <Page route={props.route} pageNumber={pageNumber} currentActivePage={props.pageNumber} />
          ))}
        {start < props.totalNumberOfPages - visibles ? (
          <li>
            <a class="fr-pagination__link fr-displayed-lg"> … </a>
          </li>
        ) : null}

        <Page route={props.route} pageNumber={props.totalNumberOfPages} currentActivePage={props.pageNumber} />
        <li>
          <a class="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label" aria-disabled={props.pageNumber === props.totalNumberOfPages} href="#">
            Page suivante
          </a>
        </li>
        <li>
          <a class="fr-pagination__link fr-pagination__link--last" aria-disabled={props.pageNumber === props.totalNumberOfPages} href="#">
            Dernière page
          </a>
        </li>
      </ul>
    </nav>
  )
}

interface PageProps {
  pageNumber: number
  currentActivePage: number
  route: RouteLocationNormalizedLoaded
}
const Page: FunctionalComponent<PageProps> = (props: PageProps) => {
  const ariaProps: Pick<HTMLAttributes, 'aria-current'> = {}
  if (props.pageNumber === props.currentActivePage) {
    ariaProps['aria-current'] = 'page'
  }

  return (
    <li>
      <AppLink class="fr-pagination__link" {...ariaProps} to={{ name: props.route.name ?? undefined, query: { ...props.route.query, page: props.pageNumber } }} title={`Page ${props.pageNumber}`}>
        {props.pageNumber}
      </AppLink>
    </li>
  )
}

const AppLink = defineComponent(
  (props: UseLinkOptions, ctx) => {
    const newProps = useLink(props)

    return () => (
      <a {...newProps} href={newProps.href.value} onClick={newProps.navigate}>
        {ctx.slots.default()}
      </a>
    )
  },
  { props: { ...RouterLink.props } }
)
