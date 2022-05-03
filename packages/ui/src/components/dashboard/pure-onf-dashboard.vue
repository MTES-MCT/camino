<template>
  <div>
    <div class="desktop-blobs">
      <div class="desktop-blob-2-3">
        <h1 class="mt-xs mb-m">Tableau de bord ONF</h1>
      </div>
    </div>
    <div v-if="status === 'LOADING'" class="loaders fixed p">
      <div class="loader" />
    </div>
    <TableAuto
      v-if="status === 'LOADED'"
      :columns="columns"
      :rows="onfTitres"
      :initialSort="{ column: initialColumnId, order: 'asc' }"
      class="width-full-p"
    />
    <Error
      v-if="status === 'ERROR'"
      :message="{
        type: 'error',
        value: 'Le serveur est inaccessible, veuillez réessayer plus tard'
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TableAuto from '../_ui/table-auto.vue'
import {
  ComponentColumnData,
  TableAutoRow,
  TextColumnData
} from '../_ui/table-auto.type'
import Error from '@/components/error.vue'
import {
  nomColumn,
  nomCell,
  referencesColumn,
  statutColumn,
  titulairesColumn,
  statutCell,
  referencesCell,
  titulairesCell
} from '@/components/titres/table-utils'
import { CommonTitreONF } from 'camino-common/src/titres'
import { markRaw } from '@vue/reactivity'
import DateComponent from '../_ui/date.vue'
import { datesDiffInDays } from 'camino-common/src/date'

const status = ref<'LOADING' | 'LOADED' | 'ERROR'>('LOADING')
const onfTitres = ref<TableAutoRow[]>([])
const props = defineProps<{
  getOnfTitres: () => Promise<CommonTitreONF[]>
}>()

const columns = [
  nomColumn,
  statutColumn,
  referencesColumn,
  titulairesColumn,
  {
    id: 'dateCompletudePTMG',
    name: 'Date complétude PTMG'
  },
  {
    id: 'dateReceptionONF',
    name: 'Date réception ONF'
  },
  {
    id: 'dateCARM',
    name: 'Date CARM'
  },
  {
    id: 'delaiJourONFCARM',
    name: 'Délai jour CARM ONF',
    sort: (firstElement: TableAutoRow, secondElement: TableAutoRow) => {
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
    }
  }
] as const

const initialColumnId = columns[1].id

type Columns = typeof columns[number]['id']

const dateCell = (date: string) => ({
  component: markRaw(DateComponent),
  props: { date },
  value: date
})

const titresLignesBuild = (
  titres: CommonTitreONF[]
): TableAutoRow<Columns>[] => {
  return titres.map(titre => {
    let delai = ''
    if (titre.dateCARM !== '' && titre.dateReceptionONF !== '') {
      delai = datesDiffInDays(
        new Date(titre.dateReceptionONF),
        new Date(titre.dateCARM)
      ).toString(10)
    }
    const columns: { [key in Columns]: ComponentColumnData | TextColumnData } =
      {
        nom: nomCell(titre),
        statut: statutCell(titre),
        references: referencesCell(titre),
        titulaires: titulairesCell(titre),
        dateCompletudePTMG: dateCell(titre.dateCompletudePTMG),
        dateReceptionONF: dateCell(titre.dateReceptionONF),
        dateCARM: dateCell(titre.dateCARM),
        delaiJourONFCARM: { value: delai }
      }
    return {
      id: titre.id,
      link: { name: 'titre', params: { id: titre.slug } },
      columns
    }
  })
}

onMounted(async () => {
  try {
    const titres = await props.getOnfTitres()
    onfTitres.value.push(...titresLignesBuild(titres))
    status.value = 'LOADED'
  } catch (e) {
    console.log('error', e)
    status.value = 'ERROR'
  }
})
</script>
