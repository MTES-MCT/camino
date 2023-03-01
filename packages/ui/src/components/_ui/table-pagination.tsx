import { computed, defineComponent } from 'vue'
import { Column, Table, TableRow, TableSortEvent } from './newTable'
import { Pagination } from './pagination'
import { Ranges } from './ranges'

export interface Params {
  page?: number
  range?: number
}
interface Props {
  columns: readonly Column[]
  rows: TableRow[]
  total: number
  range?: number
  page?: number
  column?: string
  order?: 'asc' | 'desc'
  pagination?: boolean
  paramsUpdate: (params: Params | TableSortEvent) => void
}

// FIXME TEST
export const TablePagination = defineComponent<Props>({
  props: [
    'columns',
    'rows',
    'total',
    'range',
    'page',
    'column',
    'order',
    'pagination',
    'paramsUpdate'
  ] as unknown as undefined,
  setup(props) {
    const update = (params: Params | TableSortEvent) => {
      if (!Object.keys(params).includes('page') && pagination.value) {
        Object.assign(params, { page: 1 })
      }

      props.paramsUpdate(params)
    }

    const rangeUpdate = (range: number) => {
      update({ range })
    }
    const pageUpdate = (page: number) => {
      update({ page })
    }
    const range = computed(() => {
      return props.range ?? 200
    })
    const page = computed(() => {
      return props.page ?? 1
    })

    const column = computed(() => {
      return props.column ?? ''
    })

    const order = computed(() => {
      return props.order ?? 'asc'
    })

    const pagination = computed(() => {
      return props.pagination ?? true
    })
    const pages = computed(() => {
      return Math.ceil(props.total / range.value)
    })
    return () => (
      <div>
        <Table
          column={column.value}
          columns={props.columns}
          order={order.value}
          rows={props.rows}
          class="width-full-p"
          update={update}
        />

        {pagination.value ? (
          <div class="desktop-blobs">
            <div class="desktop-blob-3-4">
              <Pagination
                active={page.value}
                total={pages.value}
                visibles={5}
                pageChange={pageUpdate}
              />
            </div>
            <div class="desktop-blob-1-4">
              {props.total > 10 ? (
                <Ranges
                  ranges={[10, 50, 200, 500]}
                  range={range.value}
                  rangeUpdate={rangeUpdate}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    )
  }
})
