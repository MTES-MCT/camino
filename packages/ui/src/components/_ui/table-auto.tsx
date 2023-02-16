import { reactive, watch, defineComponent } from 'vue'
import { InitialSort, TableRow, TableSortEvent, Table } from './newTable'

export interface Column<T = string> {
  id: T
  name: string
  class?: string[]
  sort?: (firstElement: TableRow, secondElement: TableRow) => number
  noSort?: boolean
}

interface Props {
  rows: TableRow[]
  columns: readonly Column[]
  initialSort?: InitialSort
}

export const TableAuto = defineComponent<Props>({
  props: ['rows', 'columns', 'initialSort'] as unknown as undefined,
  setup(props) {
    const sort = reactive<TableSortEvent>({
      column: props?.initialSort?.column ?? props.columns[0].id,
      order: props?.initialSort?.order ?? 'asc'
    })
    const myRows = reactive<TableRow[]>([...props.rows])
    handleChange(sort)
    watch(
      () => props.rows,
      () => {
        myRows.splice(0, myRows.length, ...props.rows)
        handleChange(sort)
      },
      { deep: true }
    )
    function handleChange(event: TableSortEvent) {
      const column = props.columns.find(column => column.id === event.column)
      let sortFunction = (row1: TableRow, row2: TableRow): number => {
        const value1 = row1.columns[event.column].value
        const value2 = row2.columns[event.column].value
        if (value1 && value2) {
          if (value1 < value2) {
            return event.order === 'asc' ? -1 : 1
          }
          if (value1 > value2) {
            return event.order === 'asc' ? 1 : -1
          }
        }

        if (value1) {
          return event.order === 'asc' ? -1 : 1
        }

        if (value2) {
          return event.order === 'asc' ? 1 : -1
        }
        return 0
      }
      if (column?.sort !== undefined) {
        sortFunction = (row1: TableRow, row2: TableRow) => {
          const sorted = column?.sort?.(row1, row2) ?? 0

          return event.order === 'asc' ? sorted : -sorted
        }
      }
      myRows.sort(sortFunction)
      sort.column = event.column
      sort.order = event.order
      console.log('sort', sort)
    }

    return () => (
      <Table
        columns={props.columns}
        rows={myRows}
        column={sort.column}
        order={sort.order}
        update={handleChange}
      />
    )
  }
})
