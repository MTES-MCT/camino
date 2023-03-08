import { computed, FunctionalComponent, ref } from 'vue'
import { Column, Table, TableRow, TableSortEvent } from './table'
import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import Accordion from './accordion.vue'

const ranges = [10, 50, 200, 500] as const
type Range = (typeof ranges)[number]

export interface Params {
  page?: number
  range?: number
}
interface Props {
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
  column?: string
  order?: 'asc' | 'desc'
  paramsUpdate: (params: Params | TableSortEvent) => void
}

export const TablePagination = caminoDefineComponent<Props>(['data', 'column', 'order', 'pagination', 'paramsUpdate'], props => {
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
    return props.pagination.range ?? 200
  })
  const page = computed(() => {
    return props.pagination.page ?? 1
  })

  const column = computed(() => {
    return props.column ?? ''
  })

  const order = computed(() => {
    return props.order ?? 'asc'
  })

  const pagination = computed(() => {
    return props.pagination.active ?? true
  })
  const pages = computed(() => {
    return Math.ceil(props.data.total / range.value)
  })
  return () => (
    <div>
      <Table column={column.value} columns={props.data.columns} order={order.value} rows={props.data.rows} class="width-full-p" update={update} />

      {pagination.value ? (
        <div class="desktop-blobs">
          <div class="desktop-blob-3-4">
            <Pagination active={page.value} total={pages.value} visibles={5} pageChange={pageUpdate} />
          </div>
          <div class="desktop-blob-1-4">{props.data.total > 10 ? <Ranges range={range.value} rangeUpdate={rangeUpdate} /> : null}</div>
        </div>
      ) : null}
    </div>
  )
})

interface RangeProps {
  range: Range
  rangeUpdate: (range: Range) => void
}

const isRange = (range: number): range is Range => ranges.includes(range)
const Ranges = caminoDefineComponent<RangeProps>(['range', 'rangeUpdate'], props => {
  const opened = ref(false)

  const toggle = () => {
    opened.value = !opened.value
  }

  return () => (
    <Accordion class="mb" opened={opened.value} slotDefault={true} onToggle={toggle}>
      {{
        title: () => <span> Éléments </span>,
        default: () => (
          <ul class="list-sans mt-m px-m">
            {ranges.map(r => (
              <li key={r}>
                <label>
                  <input
                    checked={r === props.range}
                    value={r}
                    type="radio"
                    class="mr-s"
                    onChange={e => {
                      if (isEventWithTarget(e)) {
                        const value = Number(e.target.value)
                        if (isRange(value)) {
                          props.rangeUpdate(value)
                        }
                      }
                    }}
                  />
                  {r}
                </label>
              </li>
            ))}
          </ul>
        ),
      }}
    </Accordion>
  )
})

interface PaginationProps {
  total: number
  active: number
  visibles: number
  pageChange: (page: number) => void
}

const Pagination: FunctionalComponent<PaginationProps> = props => {
  const total = props.total ?? 2
  const active = props.active ?? 1
  const visibles = props.visibles ?? 1

  const delta = () => {
    return Math.round((visibles - 1) / 2)
  }
  const pages = () => {
    let filter
    if (active <= delta()) {
      filter = (n: number) => n <= delta() * 2 + 1
    } else if (active >= total - delta()) {
      filter = (n: number) => n >= total - delta() * 2
    } else {
      filter = (n: number) => n >= active - delta() && n <= active + delta()
    }
    return Array.from(Array(total).keys())
      .map(n => n + 1)
      .filter(filter)
  }

  if (total <= 1) {
    return null
  }
  return (
    <ul class="list-inline">
      <li class="mr-xs">
        <button disabled={active === 1} class="btn-border rnd-xs px-m py-s" onClick={() => props.pageChange(1)}>
          «
        </button>
      </li>
      <li class="mr-xs">
        <button disabled={active === 1} class="btn-border rnd-xs px-m py-s" onClick={() => props.pageChange(active - 1)}>
          ‹
        </button>
      </li>
      {active > delta() + 1 ? (
        <li class="mr-xs">
          <div class="px-m py-s">…</div>
        </li>
      ) : null}

      {pages().map(page => (
        <li key={page} class={`mr-xs ${active === page ? 'active' : ''}`}>
          <button class="btn-border rnd-xs px-m py-s" onClick={() => props.pageChange(page)}>
            {page}
          </button>
        </li>
      ))}

      {active < total - delta() ? (
        <li class="mr-xs">
          <div class="px-m py-s">…</div>
        </li>
      ) : null}

      <li class="mr-xs">
        <button disabled={active === total} class="btn-border rnd-xs px-m py-s" onClick={() => props.pageChange(active + 1)}>
          ›
        </button>
      </li>
      <li class="mr-xs">
        <button disabled={active === total} class="btn-border rnd-xs px-m py-s" onClick={() => props.pageChange(total)}>
          »
        </button>
      </li>
    </ul>
  )
}
