import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { reactive, ref, watch } from 'vue'
import { InitialSort, TableRow, TableSortEvent, DisplayColumn } from './table'

export interface Column<T = string> {
  id: T
  name: string
  class?: string[]
  sort?: (firstElement: TableRow, secondElement: TableRow) => number
  noSort?: boolean
}

interface Props {
  caption: string
  rows: TableRow[]
  columns: readonly Column[]
  initialSort: InitialSort | 'noSort' | 'firstColumnAsc'
}
export const TableAuto = caminoDefineComponent<Props>(['caption', 'rows', 'columns', 'initialSort'], props => {
  const sort = ref<TableSortEvent | null>(props.initialSort === 'noSort' ? null : props.initialSort === 'firstColumnAsc' ? {
    colonne: props.columns[0].id,
    ordre: 'asc',
  } : {
    colonne: props.initialSort.colonne,
    ordre: props.initialSort.ordre,
  })

  const myRows = reactive<TableRow[]>([...props.rows])
  handleChange(sort.value)
  watch(
    () => props.rows,
    () => {
      myRows.splice(0, myRows.length, ...props.rows)
      handleChange(sort.value)
    },
    { deep: true }
  )
  function handleChange(event: TableSortEvent | null) {
    if (event !== null) {

    
    const column = props.columns.find(column => column.id === event.colonne)
    let sortFunction = (row1: TableRow, row2: TableRow): number => {
      const value1 = row1.columns[event.colonne].value
      const value2 = row2.columns[event.colonne].value
      if (value1 !== undefined && value2 !== undefined) {
        if (value1 < value2) {
          return event.ordre === 'asc' ? -1 : 1
        }
        if (value1 > value2) {
          return event.ordre === 'asc' ? 1 : -1
        }
      }

      if (value1 !== undefined) {
        return event.ordre === 'asc' ? -1 : 1
      }

      if (value2 !== undefined) {
        return event.ordre === 'asc' ? 1 : -1
      }

      return 0
    }
    if (column?.sort !== undefined) {
      sortFunction = (row1: TableRow, row2: TableRow) => {
        const sorted = column?.sort?.(row1, row2) ?? 0

        return event.ordre === 'asc' ? sorted : -sorted
      }
    }
    myRows.sort(sortFunction)
    
    if (sort.value !== null) {
      sort.value.colonne = event.colonne
      sort.value.ordre = event.ordre
    }
    }
  }


  const handleChangeCurrentColonne = () => {
    if (sort.value !== null) {
      handleChange({ colonne: sort.value.colonne, ordre: sort.value.ordre === 'asc' ? 'desc' : 'asc' })
    }
  }
  const handleChangeNewColonne = (id: string) => (event: MouseEvent) => {
    event.stopPropagation()
    if (sort.value !== null) {
      handleChange({ colonne: id, ordre: sort.value.ordre })
    }
  }
  return () => (
    <div style={{ overflowX: 'auto' }}>
      <div class="fr-table">
        <table style={{ display: 'table' }}>
          <caption>{props.caption}</caption>
          <thead>
            <tr>
              {props.columns.map(col => (
                <th key={col.id} scope="col" class={[...(col.class ?? []), 'nowrap']}>
                  {col.noSort !== undefined && col.noSort ? (
                    <div class="fr-text--md">{col.name === '' ? '-' : col.name}</div>
                  ) : sort.value !== null && sort.value.colonne === col.id ? (
                    <a
                      class={['fr-link', 'fr-link--icon-right', sort.value.ordre === 'asc' ? 'fr-icon-arrow-down-fill' : 'fr-icon-arrow-up-fill']}
                      onClick={handleChangeCurrentColonne}
                      title={sort.value.ordre === 'asc' ? `Trier par la colonne ${col.name} par ordre descendant` : `Trier par la colonne ${col.name} par ordre ascendant`}
                      aria-label={sort.value.ordre === 'asc' ? `Trier par la colonne ${col.name} par ordre descendant` : `Trier par la colonne ${col.name} par ordre ascendant`}
                      href="#!"
                    >
                      {col.name}
                    </a>
                  ) : (
                    <a
                      class={['fr-link']}
                      onClick={handleChangeNewColonne(col.id)}
                      title={`Trier par la colonne ${col.name}`}
                      aria-label={`Trier par la colonne ${col.name}`}
                      href="#!"
                    >
                      {col.name === '' ? '-' : col.name}
                    </a>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myRows.map(row => (
              <tr key={row.id} class={row.class}>
                {props.columns.map((col, index) => (
                  <td key={col.id} class={[...(col.class ?? [])]}>
                    {index === 0 && row.link !== null ? (
                      <router-link class="fr-link" to={row.link}>
                        <DisplayColumn data={row.columns[col.id]} />
                      </router-link>
                    ) : (
                      <DisplayColumn data={row.columns[col.id]} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})
