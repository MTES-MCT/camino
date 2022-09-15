<template>
  <div>
    <div class="desktop-blobs">
      <div class="desktop-blob-2-3">
        <h1 class="mt-xs mb-xxl">Tableau de bord {{ isDGTM ? 'DGTM' : '' }}</h1>
      </div>
    </div>
    <div v-if="isDGTM" class="mb-l">
      <PureDGTMStats :getDgtmStats="getDgtmStats" />
    </div>
    <div v-if="status === 'LOADING'" class="loaders fixed p">
      <div class="loader" />
    </div>
    <div v-if="status === 'LOADED'">
      <template v-if="drealTitresBloques.length">
        <div class="line-neutral width-full mb-l"></div>
        <h3>Titres en attente de la DREAL</h3>
        <TableAuto
          class="mb-xxl"
          :columns="columns.slice(0, 4)"
          :rows="drealTitresBloques"
          :initialSort="{ column: initialColumnId, order: 'asc' }"
        />
      </template>
      <div class="line-neutral width-full mb-l"></div>
      <h3>Titres en cours d’instruction</h3>
      <TableAuto
        :columns="columns"
        :rows="drealTitres"
        :initialSort="{ column: initialColumnId, order: 'asc' }"
        class="width-full-p"
      />
    </div>
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
import PureDGTMStats from './pure-dgtm-stats.vue'
import Error from '@/components/error.vue'
import {
  nomColumn,
  domaineColumn,
  nomCell,
  referencesColumn,
  statutColumn,
  titulairesColumn,
  statutCell,
  referencesCell,
  titulairesCell,
  typeColumn,
  domaineCell,
  typeCell,
  activiteColumn,
  activitesCell
} from '@/components/titres/table-utils'
import { CommonTitreDREAL } from 'camino-common/src/titres'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'

const status = ref<'LOADING' | 'LOADED' | 'ERROR'>('LOADING')
const drealTitres = ref<TableAutoRow[]>([])
const drealTitresBloques = ref<TableAutoRow[]>([])
const props = defineProps<{
  getDrealTitres: () => Promise<CommonTitreDREAL[]>
  isDGTM: boolean
  getDgtmStats: () => Promise<StatistiquesDGTM>
}>()

const columns = [
  nomColumn,
  domaineColumn,
  typeColumn,
  statutColumn,
  activiteColumn,
  referencesColumn,
  titulairesColumn
] as const

const initialColumnId = columns[3].id

type Columns = typeof columns[number]['id']

const titresLignesBuild = (
  titres: CommonTitreDREAL[]
): TableAutoRow<Columns>[] => {
  return titres.map(titre => {
    const columns: { [key in Columns]: ComponentColumnData | TextColumnData } =
      {
        nom: nomCell(titre),
        domaine: domaineCell(titre),
        type: typeCell(titre),
        statut: statutCell(titre),
        activites: activitesCell(titre),
        references: referencesCell(titre),
        titulaires: titulairesCell(titre)
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
    const titres = await props.getDrealTitres()
    drealTitres.value.push(
      ...titresLignesBuild(titres.filter(titre => !titre.enAttenteDeDREAL))
    )
    drealTitresBloques.value.push(
      ...titresLignesBuild(titres.filter(titre => titre.enAttenteDeDREAL))
    )
    status.value = 'LOADED'
  } catch (e) {
    console.log('error', e)
    status.value = 'ERROR'
  }
})
</script>
