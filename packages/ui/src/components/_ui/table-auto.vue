<template>
  <Table
    :columns="props.columns"
    :rows="myRows"
    :column="sort.column"
    :order="sort.order"
    @params-update="handleChange"
  />
</template>

<script setup lang="ts">
import {
  Column,
  InitialSort,
  TableAutoRow,
  TableSortEvent
} from './table-auto.type'
import Table from './table.vue'
import { reactive, watch } from 'vue'

const props = defineProps<{
  rows: TableAutoRow[]
  columns: readonly Column[]
  initialSort?: InitialSort
}>()

const sort = reactive<TableSortEvent>({
  column: props?.initialSort?.column ?? props.columns[0].id,
  order: props?.initialSort?.order ?? 'asc'
})
const myRows = reactive<TableAutoRow[]>([...props.rows])
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
  let sortFunction = (row1: TableAutoRow, row2: TableAutoRow): number => {
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
    sortFunction = (row1: TableAutoRow, row2: TableAutoRow) => {
      const sorted = column?.sort?.(row1, row2) ?? 0

      return event.order === 'asc' ? sorted : -sorted
    }
  }
  myRows.sort(sortFunction)
  sort.column = event.column
  sort.order = event.order
}
</script>
