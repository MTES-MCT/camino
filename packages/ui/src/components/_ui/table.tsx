import { watch } from 'vue'
import { Icon } from '@/components/_ui/icon'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'

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
    params: {
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
  class?: string[]
  noSort?: boolean
}

export const isComponentColumnData = (columnRow: ComponentColumnData | TextColumnData): columnRow is ComponentColumnData => {
  return 'component' in columnRow
}

interface Props {
  columns: readonly Column[]
  rows: TableRow[]
  update: (event: TableSortEvent) => void
  column: Props['columns'][number]['id']
  order: 'asc' | 'desc'
}

export const Table = caminoDefineComponent<Props>(['columns', 'rows', 'update', 'column', 'order'], props => {
  const sort = (colId: Props['column']) => {
    if (!props.columns.find(c => c.id === colId)?.noSort) {
      if (props.column === colId) {
        const order = props.order === 'asc' ? 'desc' : 'asc'
        props.update({ column: props.column, order })
      } else {
        props.update({ column: colId, order: props.order })
      }
    }
  }

  const columnInit = () => {
    if (props.rows.length && !props.columns.some(c => c.id === props.column)) {
      sort(props.columns[0].id)
    }
  }

  watch(
    () => props.columns,
    _columns => {
      columnInit()
    },
    { immediate: true }
  )
  return () => (
    <div>
      <div class="overflow-scroll-x mb">
        <div class="table">
          <div class="tr">
            {props.columns.map(col => (
              <div key={col.id} class={`th nowrap ${(col.class ?? []).join(' ')}`} onClick={() => sort(col.id)}>
                <button class={`btn-menu full-x p-0${col.noSort ? ' disabled' : ''}`}>
                  {col.name || (props.column === col.id ? '' : '–')}
                  {!col.noSort && props.column === col.id ? <Icon class="right" size="M" name={props.order === 'asc' ? 'chevron-bas' : 'chevron-haut'} /> : null}
                </button>
              </div>
            ))}
          </div>

          {props.rows.map(row => (
            <router-link key={row.id} to={row.link} class="tr tr-link text-decoration-none">
              {props.columns.map(col => (
                <div key={col.id} class={`td ${(col.class ?? []).join(' ')}`}>
                  <DisplayColumn data={row.columns[col.id]} />
                </div>
              ))}
            </router-link>
          ))}
        </div>
      </div>
    </div>
  )
})

const DisplayColumn = (props: { data: ComponentColumnData | TextColumnData }): JSX.Element => {
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
