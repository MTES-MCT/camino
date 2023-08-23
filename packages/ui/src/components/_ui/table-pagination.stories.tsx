import { TablePagination } from './table-pagination'
import { Meta, StoryFn } from '@storybook/vue3'
import { markRaw } from 'vue'
import { TitreNom } from '../_common/titre-nom'
import { Domaine } from '../_common/domaine'
import { TitreTypeTypeNom } from '../_common/titre-type-type-nom'
import { Statut } from '../_common/statut'
import { Column, TableRow } from './table'
import { action } from '@storybook/addon-actions'
import { vueRouter } from 'storybook-vue3-router'
import { AsyncData } from '@/api/client-rest'

const customRoutes = [...Array(11)].map((_, row) => ({ name: `elementlink${row}`, params: { id: `elementslug${row}` }, value: `elementslug${row}` }))

const meta: Meta = {
  title: 'Components/UI/Table',
  // @ts-ignore
  component: TablePagination,
  decorators: [vueRouter([...customRoutes, { name: '/plop' }])],
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
    }),
  },
}

export const Loading: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={{ status: 'LOADING' }}
    caption="Test de pagination"
    route={{ query: { page: '3', intervalle: '10' }, name: '/plop' }}
    updateParams={action('updateParams')}
  />
)

export const WithError: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={{ status: 'ERROR', message: 'une erreur' }}
    caption="Test de pagination"
    route={{ query: { page: '3', intervalle: '10' }, name: '/plop' }}
    updateParams={action('updateParams')}
  />
)

export const Pagination: StoryFn = () => (
  <TablePagination columns={columns} data={rows} caption="Test de pagination" route={{ query: { page: '3', intervalle: '10' }, name: '/plop' }} updateParams={action('updateParams')} />
)

export const PaginationAuDebut: StoryFn = () => (
  <TablePagination columns={columns} data={rows} caption="Test de pagination" route={{ query: { page: '1', intervalle: '10' }, name: '/plop' }} updateParams={action('updateParams')} />
)

export const PaginationALaFin: StoryFn = () => (
  <TablePagination columns={columns} data={rows} caption="Test de pagination" route={{ query: { page: '20', intervalle: '10' }, name: '/plop' }} updateParams={action('updateParams')} />
)

export const PaginationAuMilieu: StoryFn = () => (
  <TablePagination columns={columns} data={rows} caption="Test de pagination" route={{ query: { page: '8', intervalle: '10' }, name: '/plop' }} updateParams={action('updateParams')} />
)

export const NeCassePasSiPasPaginationFausse: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={{ status: 'LOADED', value: { total: 1, rows: [rows.value.rows[0]] } }}
    caption="Test de pagination"
    route={{ query: { page: '5', intervalle: '10' }, name: '/plop' }}
    updateParams={action('updateParams')}
  />
)

export const PetitePagination: StoryFn = () => (
  <TablePagination
    columns={columns}
    data={{ status: 'LOADED', value: { total: 16, rows: rows.value.rows.slice(0, 10) } }}
    caption="Test de pagination"
    route={{ query: { page: '1', intervalle: '10' }, name: '/plop' }}
    updateParams={action('updateParams')}
  />
)
