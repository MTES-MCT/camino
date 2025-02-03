import { Column, Table, TableRow } from './table'
import { Meta, StoryFn } from '@storybook/vue3'
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
    contentTitle: 'Nom',
  },
  {
    id: 'domaine',
    contentTitle: '',
  },
  {
    id: 'type',
    contentTitle: 'Type',
  },
  {
    id: 'statut',
    contentTitle: 'Statut',
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
        type: 'jsx',
        jsxElement: <TitreNom nom={`220222_${row}`} />,
        value: `220222_${row}`,
      },
      domaine: {
        type: 'jsx',
        jsxElement: <Domaine domaineId="m" />,
        value: 'm',
      },
      type: {
        type: 'jsx',
        jsxElement: <TitreTypeTypeNom titreTypeId="arm" />,
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

const update = action('update')
export const Simple: StoryFn = () => (
  <Table
    route={{ query: { page: '1', intervalle: '10' }, name: 'dashboard', params: {} }}
    rows={{ value: { rows, total: rows.length }, status: 'LOADED' }}
    columns={columns}
    caption={{ value: 'Caption cachée', visible: false }}
    updateParams={update}
    sortType="route"
  />
)

export const SimpleWithCaption: StoryFn = () => (
  <Table
    route={{ query: { page: '1', intervalle: '10' }, name: 'dashboard', params: {} }}
    rows={{ value: { rows, total: rows.length }, status: 'LOADED' }}
    columns={columns}
    caption={{ value: 'Caption visible', visible: true }}
    updateParams={update}
    sortType="route"
  />
)
