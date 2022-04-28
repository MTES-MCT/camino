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
  // eslint-disable-next-line no-unused-vars
  props: { [key in string]: unknown }
  class?: string
  value: string | string[] | number | undefined
}

export interface TextColumnData {
  value: string
}

export interface TableAutoRow {
  id: string
  link: {
    name: string
    params: {
      id: string
    }
  }
  columns: {
    // TODO 2022-03-17: type this with the row definition. And why eslint, why
    // eslint-disable-next-line no-unused-vars
    [key in string]: ComponentColumnData | TextColumnData
  }
}

export interface Column {
  id: string
  name: string
  class?: string[]
  sort?: (firstElement: TableAutoRow, secondElement: TableAutoRow) => number
}
