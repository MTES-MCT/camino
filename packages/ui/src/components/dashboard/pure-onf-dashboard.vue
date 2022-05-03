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
import Date from '../_ui/date.vue'

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
  }
] as const

const initialColumnId = columns[1].id

type Columns = typeof columns[number]['id']

const dateCell = (date: string) => ({
  component: markRaw(Date),
  props: { date },
  value: date
})

const titresLignesBuild = (
  titres: CommonTitreONF[]
): TableAutoRow<Columns>[] => {
  return titres.map(titre => {
    const columns: { [key in Columns]: ComponentColumnData | TextColumnData } =
      {
        nom: nomCell(titre),
        statut: statutCell(titre),
        references: referencesCell(titre),
        titulaires: titulairesCell(titre),
        dateCompletudePTMG: dateCell(titre.dateCompletudePTMG),
        dateReceptionONF: dateCell(titre.dateReceptionONF)
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
