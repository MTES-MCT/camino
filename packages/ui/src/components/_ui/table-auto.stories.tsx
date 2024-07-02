import { Column, TableAuto } from './table-auto'
import { Meta, StoryFn } from '@storybook/vue3'
import { markRaw } from 'vue'
import { TitreNom } from '../_common/titre-nom'
import { Domaine } from '../_common/domaine'
import { TitreTypeTypeNom } from '../_common/titre-type-type-nom'
import { TableRow } from './table'
import { DemarcheStatut } from '../_common/demarche-statut'

const meta: Meta = {
  title: 'Components/UI/Table',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: TableAuto,
}
export default meta

const columns: Column[] = [
  {
    id: 'nom',
    name: 'Nom',
    class: ['min-width-8'],
  },
  {
    id: 'domaine',
    name: '',
  },
  {
    id: 'type',
    name: 'Type',
    class: ['min-width-8'],
  },
  {
    id: 'statut',
    name: 'Statut',
    class: ['nowrap', 'min-width-5'],
  },
  {
    id: 'test',
    name: 'Test',
  },
]

const rows: TableRow[] = [0, 1, 2, 3].map(row => {
  return {
    id: `elementId${row}`,
    link: {
      name: `elementlink${row}`,
      params: {
        id: `elementslug${row}`,
      },
      value: `elementslug${row}`,
    },
    columns: {
      nom: {
        component: markRaw(TitreNom),
        props: {
          nom: `220222_${row}`,
        },
        value: `220222_${row}`,
      },
      domaine: {
        component: markRaw(Domaine),
        props: {
          domaineId: 'm',
        },
        value: 'm',
      },
      type: {
        component: markRaw(TitreTypeTypeNom),
        props: { titreTypeId: 'arm' },
        value: 'arm',
      },
      statut: {
        component: markRaw(DemarcheStatut),
        props: {
          demarcheStatutId: 'eco',
        },
        value: `Demande initiale ${row}`,
      },
      test: {
        value: `Test value ${row}`,
      },
    },
  }
})

export const TableAutoSimple: StoryFn = () => <TableAuto caption="simple" rows={rows} columns={columns} initialSort={'firstColumnAsc'} />
export const TableAutoSortedByStatusAsc: StoryFn = () => <TableAuto caption="sorted by status asc" rows={rows} columns={columns} initialSort={{ colonne: 'statut', ordre: 'desc' }} />
