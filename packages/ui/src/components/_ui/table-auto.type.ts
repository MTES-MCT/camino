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
}

export interface TableAutoRow<T extends string = string> {
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
  sort?: (firstElement: TableAutoRow, secondElement: TableAutoRow) => number
  noSort?: boolean
}
