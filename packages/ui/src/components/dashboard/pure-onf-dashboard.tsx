import { markRaw, onMounted, ref } from 'vue'
import { TableAuto } from '../_ui/table-auto'
import { DateComponent } from '../_ui/date'

import { nomColumn, nomCell, referencesColumn, statutColumn, titulairesColumn, statutCell, referencesCell, titulairesCell } from '@/components/titres/table-utils'

import { CaminoError } from '@/components/error'
import { CommonTitreONF } from 'camino-common/src/titres'
import { daysBetween, toCaminoDate } from 'camino-common/src/date'
import { ComponentColumnData, TableRow, TextColumnData } from '../_ui/table'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { DashboardApiClient } from './dashboard-api-client'
export interface Props {
  apiClient: Pick<DashboardApiClient, 'getOnfTitres'>
}

const columns = [
  nomColumn,
  statutColumn,
  referencesColumn,
  titulairesColumn,
  {
    id: 'dateCompletudePTMG',
    name: 'Date complétude PTMG',
  },
  {
    id: 'dateReceptionONF',
    name: 'Date réception ONF',
  },
  {
    id: 'dateCARM',
    name: 'Date CARM',
  },
  {
    id: 'delaiJourONFCARM',
    name: 'Délai jour CARM ONF',
    sort: (firstElement: TableRow, secondElement: TableRow) => {
      const row1Number = firstElement.columns.delaiJourONFCARM.value
      const row2Number = secondElement.columns.delaiJourONFCARM.value
      if (typeof row1Number === 'string' && typeof row2Number === 'string') {
        const number1 = Number.parseInt(row1Number, 10)
        const number2 = Number.parseInt(row2Number, 10)

        if (Number.isNaN(number1)) {
          return -1
        }
        if (Number.isNaN(number2)) {
          return 1
        }
        return number1 - number2
      }
      return 0
    },
  },
] as const

const initialColumnId = columns[1].id

type Columns = (typeof columns)[number]['id']

const dateCell = (date: string) => ({
  component: markRaw(DateComponent),
  props: { date },
  value: date,
})

const titresLignesBuild = (titres: CommonTitreONF[]): TableRow<Columns>[] => {
  return titres.map(titre => {
    let delai = ''
    if (titre.dateCARM !== '' && titre.dateReceptionONF !== '') {
      delai = daysBetween(toCaminoDate(titre.dateReceptionONF), toCaminoDate(titre.dateCARM)).toString(10)
    }
    const columns: { [key in Columns]: ComponentColumnData | TextColumnData } = {
      nom: nomCell(titre),
      statut: statutCell(titre),
      references: referencesCell(titre),
      titulaires: titulairesCell(titre),
      dateCompletudePTMG: dateCell(titre.dateCompletudePTMG),
      dateReceptionONF: dateCell(titre.dateReceptionONF),
      dateCARM: dateCell(titre.dateCARM),
      delaiJourONFCARM: { value: delai },
    }
    return {
      id: titre.id,
      link: { name: 'titre', params: { id: titre.slug } },
      columns,
    }
  })
}

export const PureONFDashboard = caminoDefineComponent<Props>(['apiClient'], props => {
  const status = ref<'LOADING' | 'LOADED' | 'ERROR'>('LOADING')
  const onfTitres = ref<TableRow[]>([])
  const onfTitresBloques = ref<TableRow[]>([])
  onMounted(async () => {
    try {
      const titres = await props.apiClient.getOnfTitres()
      onfTitres.value.push(...titresLignesBuild(titres.filter(titre => !titre.enAttenteDeONF)))
      onfTitresBloques.value.push(...titresLignesBuild(titres.filter(titre => titre.enAttenteDeONF)))
      status.value = 'LOADED'
    } catch (e) {
      console.error('error', e)
      status.value = 'ERROR'
    }
  })

  return () => (
    <div>
      <div class="desktop-blobs">
        <div class="desktop-blob-2-3">
          <h1 class="mt-xs mb-xxl">Tableau de bord ONF</h1>
        </div>
      </div>
      {status.value === 'LOADING' ? (
        <div class="loaders fixed p">
          <div class="loader" />
        </div>
      ) : null}

      {status.value === 'LOADED' ? (
        <div>
          {onfTitresBloques.value.length > 0 ? (
            <>
              <div class="line-neutral width-full mb-l"></div>
              <h3>ARM en attente</h3>
              <TableAuto class="mb-xxl" columns={columns.slice(0, 5)} rows={onfTitresBloques.value} initialSort={{ column: initialColumnId, order: 'asc' }} />
            </>
          ) : null}
          <div class="line-neutral width-full mb-l"></div>
          <h3>ARM en cours d’instruction</h3>
          <TableAuto columns={columns} rows={onfTitres.value} initialSort={{ column: initialColumnId, order: 'asc' }} class="width-full-p" />
        </div>
      ) : null}

      {status.value === 'ERROR' ? <CaminoError couleur="error" message="Le serveur est inaccessible, veuillez réessayer plus tard" /> : null}
    </div>
  )
})
