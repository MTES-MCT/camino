import { Column, Table, TableRow } from './table'
import { Meta, StoryFn } from '@storybook/vue3'
import { markRaw } from 'vue'
import { TitreNom } from '../_common/titre-nom'
import { Domaine } from '../_common/domaine'
import { TitreTypeTypeNom } from '../_common/titre-type-type-nom'
import { action } from '@storybook/addon-actions'
import { DemarcheStatut } from '../_common/demarche-statut'

const meta: Meta = {
  title: 'Components/UI/Table',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: Table,
}
export default meta

const columns: Column[] = [
  {
    id: 'nom',
    name: 'Nom',
  },
  {
    id: 'domaine',
    name: '',
  },
  {
    id: 'type',
    name: 'Type',
  },
  {
    id: 'statut',
    name: 'Statut',
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

const update = action('update')
export const Simple: StoryFn = () => <Table route={{ query: { page: '1', intervalle: '10' }, name: 'dashboard' }} rows={rows} columns={columns} caption="Caption cachée" updateParams={update} />
