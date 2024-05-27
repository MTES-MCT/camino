import { FunctionalComponent, computed, defineComponent, markRaw, onMounted, ref } from 'vue'
import { TableAuto } from '../_ui/table-auto'
import { DateComponent } from '../_ui/date'

import { nomColumn, nomCell, referencesColumn, statutAutoColumn, titulairesColumn, statutCell, referencesCell, titulairesCell } from '@/components/titres/table-utils'

import { CommonTitreONF } from 'camino-common/src/titres'
import { daysBetween, toCaminoDate } from 'camino-common/src/date'
import { ComponentColumnData, TableRow, TextColumnData } from '../_ui/table'
import { DashboardApiClient } from './dashboard-api-client'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'
interface Props {
  apiClient: Pick<DashboardApiClient, 'getOnfTitres'>
  entreprises: Entreprise[]
}

const columns = [
  nomColumn,
  statutAutoColumn,
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

const titresLignesBuild = (titres: CommonTitreONF[], entreprisesIndex: Record<EntrepriseId, string>): TableRow<Columns>[] => {
  return titres.map(titre => {
    let delai = ''
    if (titre.dateCARM !== '' && titre.dateReceptionONF !== '') {
      delai = daysBetween(toCaminoDate(titre.dateReceptionONF), toCaminoDate(titre.dateCARM)).toString(10)
    }
    const columns: { [key in Columns]: ComponentColumnData | TextColumnData } = {
      nom: nomCell(titre),
      statut: statutCell(titre),
      references: referencesCell(titre),
      titulaires: titulairesCell(titre, entreprisesIndex),
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

export const PureONFDashboard = defineComponent<Props>(props => {
  const onfTitres = ref<AsyncData<CommonTitreONF[]>>({ status: 'LOADING' })

  onMounted(async () => {
    onfTitres.value = { status: 'LOADING' }
    try {
      const titres = await props.apiClient.getOnfTitres()
      onfTitres.value = { status: 'LOADED', value: titres }
    } catch (e: any) {
      console.error('error', e)
      onfTitres.value = { status: 'ERROR', message: e.message ?? '' }
    }
  })

  return () => (
    <div>
      <h1>Tableau de bord ONF</h1>

      <LoadingElement data={onfTitres.value} renderItem={items => <LoadedPureOnfDashboard titres={items} entreprises={props.entreprises} />} />
    </div>
  )
})

const LoadedPureOnfDashboard: FunctionalComponent<{ titres: CommonTitreONF[]; entreprises: Entreprise[] }> = props => {
  const entreprisesIndex = props.entreprises.reduce<Record<EntrepriseId, string>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise.nom

    return acc
  }, {})

  const onfTitresNonBloques = computed<TableRow[]>(() =>
    titresLignesBuild(
      props.titres.filter(titre => !titre.enAttenteDeONF),
      entreprisesIndex
    )
  )

  const onfTitresBloques = computed<TableRow[]>(() =>
    titresLignesBuild(
      props.titres.filter(titre => titre.enAttenteDeONF),
      entreprisesIndex
    )
  )

  return (
    <>
      {onfTitresBloques.value.length > 0 ? (
        <>
          <TableAuto caption="ARM en attente" columns={columns.slice(0, 5)} rows={onfTitresBloques.value} initialSort={{ colonne: initialColumnId, ordre: 'asc' }} />
        </>
      ) : null}
      <TableAuto caption="ARM en cours d’instruction" columns={columns} rows={onfTitresNonBloques.value} initialSort={{ colonne: initialColumnId, ordre: 'asc' }} />
    </>
  )
}

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureONFDashboard.props = ['apiClient', 'entreprises']
