import { Column, OldTable, Table, TableRow } from './table'
import { Meta, StoryFn } from '@storybook/vue3'
import { markRaw } from 'vue'
import { TitreNom } from '../_common/titre-nom'
import { Domaine } from '../_common/domaine'
import { TitreTypeTypeNom } from '../_common/titre-type-type-nom'
import { Statut } from '../_common/statut'
import { action } from '@storybook/addon-actions'
import { vueRouter } from 'storybook-vue3-router'

const customRoutes = [...Array(4)].map((_, row) => ({ name: `elementlink${row}`, params: { id: `elementslug${row}` }, value: `elementslug${row}` }))
const meta: Meta = {
  title: 'Components/UI/Table',
  // @ts-ignore
  component: Table,
  decorators: [vueRouter([...customRoutes, { name: '/plop' }])],
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
        component: markRaw(Statut),
        props: {
          color: 'warning',
          nom: `Demande initiale ${row}`,
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
export const Simple: StoryFn = () => <Table route={{ query: { page: '1', intervalle: '10' }, name: '/plop' }} rows={rows} columns={columns} caption="Caption cachée" updateParams={update} />
export const OldSimple: StoryFn = () => <OldTable rows={rows} columns={columns} column="nom" order="asc" update={update} />
