import { Column, TableSimple } from './table-simple'
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
  component: TableSimple,
}
export default meta

const columns: Column[] = [
  {
    id: 'nom',
    contentTitle: 'Nom',
    class: ['min-width-8'],
  },
  {
    id: 'domaine',
    contentTitle: '',
  },
  {
    id: 'type',
    contentTitle: 'Type',
    class: ['min-width-8'],
  },
  {
    id: 'statut',
    contentTitle: 'Statut',
    class: ['nowrap', 'min-width-5'],
  },
  {
    id: 'test',
    contentTitle: 'Test',
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
        type: 'component',
        component: markRaw(TitreNom),
        props: {
          nom: `220222_${row}`,
        },
        value: `220222_${row}`,
      },
      domaine: {
        type: 'component',
        component: markRaw(Domaine),
        props: {
          domaineId: 'm',
        },
        value: 'm',
      },
      type: {
        type: 'component',
        component: markRaw(TitreTypeTypeNom),
        props: { titreTypeId: 'arm' },
        value: 'arm',
      },
      statut: {
        type: 'jsx',
        jsxElement: <DemarcheStatut demarcheStatutId="eco" />,
        value: `Demande initiale ${row}`,
      },
      test: {
        type: 'text',
        value: `Test value ${row}`,
      },
    },
  }
})

export const TableAutoSimple: StoryFn = () => <TableSimple caption={{ value: 'simple', visible: true }} rows={rows} columns={columns} />
