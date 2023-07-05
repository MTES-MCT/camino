import { computed, FunctionalComponent, HTMLAttributes } from 'vue'
import { Column, Table, TableRow, TableSortEvent } from './table'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { Range, ranges, isRange } from 'camino-common/src/number'

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
  pagination: {
    active?: boolean
    range?: Range
    page?: number
  }

  caption: string
  column?: string
  order?: 'asc' | 'desc'
  paramsUpdate: (params: Params | TableSortEvent) => void
}

export const TablePagination = caminoDefineComponent<Props>(['data', 'column', 'order', 'pagination', 'paramsUpdate', 'caption'], props => {
  const update = (params: Params | TableSortEvent) => {
    if (!Object.keys(params).includes('page') && pagination.value) {
      Object.assign(params, { page: 1 })
    }

    props.paramsUpdate(params)
  }

  const pageUpdate = (page: number) => {
    update({ page })
  }

  const pageNumber = computed(() => {
    return props.pagination.page ?? 1
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
    return Math.ceil(props.data.total / (props.pagination.range ?? 10))
  })
  return () => (
    <div class="dsfr">
      <Table column={column.value} caption={props.caption} columns={props.data.columns} order={order.value} rows={props.data.rows} update={update} />

      {pagination.value ? <Pagination pageNumber={pageNumber.value} totalNumberOfPages={totalNumberOfPages.value} pageChange={pageUpdate} /> : null}
    </div>
  )
})

interface PaginationProps {
  totalNumberOfPages: number
  pageNumber: number
  pageChange: (page: number) => void
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
        <Page pageNumber={1} currentActivePage={props.pageNumber} />
        {start > 2 ? (
          <li>
            <a class="fr-pagination__link fr-displayed-lg"> … </a>
          </li>
        ) : null}

        {[...Array(visibles)]
          .map((_, index) => start + index)
          .filter(pageNumber => pageNumber !== props.totalNumberOfPages && pageNumber !== 1)
          .map(pageNumber => (
            <Page pageNumber={pageNumber} currentActivePage={props.pageNumber} />
          ))}
        {start < props.totalNumberOfPages - visibles ? (
          <li>
            <a class="fr-pagination__link fr-displayed-lg"> … </a>
          </li>
        ) : null}

        <Page pageNumber={props.totalNumberOfPages} currentActivePage={props.pageNumber} />
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
}
const Page: FunctionalComponent<PageProps> = (props: PageProps) => {
  const ariaProps: Pick<HTMLAttributes, 'aria-current'> = {}
  if (props.pageNumber === props.currentActivePage) {
    ariaProps['aria-current'] = 'page'
  }

  return (
    <li>
      <a class="fr-pagination__link" {...ariaProps} href="#" title={`Page ${props.pageNumber}`}>
        {props.pageNumber}
      </a>
    </li>
  )
}
