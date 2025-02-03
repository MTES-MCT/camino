import { TablePagination } from './table-pagination'
import { Meta, StoryFn } from '@storybook/vue3'
import { markRaw } from 'vue'
import { TitreNom } from '../_common/titre-nom'
import { Domaine } from '../_common/domaine'
import { TitreTypeTypeNom } from '../_common/titre-type-type-nom'
import { Column, TableRow } from './table'
import { action } from '@storybook/addon-actions'
import { AsyncData } from '@/api/client-rest'
import { DemarcheStatut } from '../_common/demarche-statut'

const meta: Meta = {
  title: 'Components/UI/Table',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: TablePagination,
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

const rows: AsyncData<{ total: number; rows: TableRow[] }> = {
  status: 'LOADED',
  value: {
    total: 200,
    rows: [...Array(11)].map((_, row) => {
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
            jsxElement: <DemarcheStatut demarcheStatutId="acc" />,
            value: `Demande initiale ${row}`,
          },
          test: {
            type: 'text',
            value: `Test value ${row}`,
          },
        },
      }
    }),
  },
}

export const Loading: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={{ status: 'LOADING' }}
    caption={{ value: 'Test de pagination', visible: true }}
    route={{ query: { page: '3', intervalle: '10' }, name: 'dashboard', params: {} }}
    updateParams={action('updateParams')}
  />
)

export const WithError: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={{ status: 'ERROR', message: 'une erreur' }}
    caption={{ value: 'Test de pagination', visible: true }}
    route={{ query: { page: '3', intervalle: '10' }, name: 'dashboard', params: {} }}
    updateParams={action('updateParams')}
  />
)

export const Pagination: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={rows}
    caption={{ value: 'Test de pagination', visible: true }}
    route={{ query: { page: '3', intervalle: '10' }, name: 'dashboard', params: {} }}
    updateParams={action('updateParams')}
  />
)

export const PaginationAuDebut: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={rows}
    caption={{ value: 'Test de pagination', visible: true }}
    route={{ query: { page: '1', intervalle: '10' }, name: 'dashboard', params: {} }}
    updateParams={action('updateParams')}
  />
)

export const PaginationALaFin: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={rows}
    caption={{ value: 'Test de pagination', visible: true }}
    route={{ query: { page: '20', intervalle: '10' }, name: 'dashboard', params: {} }}
    updateParams={action('updateParams')}
  />
)

export const PaginationAuMilieu: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={rows}
    caption={{ value: 'Test de pagination', visible: true }}
    route={{ query: { page: '8', intervalle: '10' }, name: 'dashboard', params: {} }}
    updateParams={action('updateParams')}
  />
)

export const NeCassePasSiPasPaginationFausse: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={{ status: 'LOADED', value: { total: 1, rows: [rows.value.rows[0]] } }}
    caption={{ value: 'Test de pagination', visible: true }}
    route={{ query: { page: '5', intervalle: '10' }, name: 'dashboard', params: {} }}
    updateParams={action('updateParams')}
  />
)

export const PetitePagination: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={{ status: 'LOADED', value: { total: 16, rows: rows.value.rows.slice(0, 10) } }}
    caption={{ value: 'Test de pagination', visible: true }}
    route={{ query: { page: '1', intervalle: '10' }, name: 'dashboard', params: {} }}
    updateParams={action('updateParams')}
  />
)
