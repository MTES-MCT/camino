import { defineComponent } from 'vue'
import { TableRow, Table, Column as TableColumn } from './table'

export type Column<T = string> = Omit<TableColumn<T>, 'noSort'>

interface Props<ColumnId extends string> {
  caption: { value: string; visible: boolean }
  rows: TableRow<ColumnId>[]
  columns: readonly Column<ColumnId>[]
}

export const TableSimple = defineComponent(<ColumnId extends string>(props: Props<ColumnId>) => {
  return () => <Table caption={props.caption} columns={props.columns} rows={{ status: 'LOADED', value: { rows: props.rows, total: props.rows.length } }} sortType="noSort" />
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TableSimple.props = ['caption', 'rows', 'columns']
