<template>
  <div>
    <div class="desktop-blobs">
      <div class="desktop-blob-2-3">
        <h1 class="mt-xs mb-xxl">Tableau de bord {{ isDGTM ? 'DGTM' : '' }}</h1>
      </div>
    </div>
    <div v-if="isDGTM" class="mb-l">
      <h3>Statistiques</h3>
      <PureDGTMStats :getDgtmStats="getDgtmStats" />
    </div>
    <div class="line-neutral width-full mb-l"></div>
    <h3>Titres</h3>
    <LoadingElement
      v-slot="{ item }"
      :data="data"
      :style="
        data.status !== 'LOADED'
          ? { display: 'flex', ['justify-content']: 'center' }
          : ''
      "
    >
      <template v-if="item.drealTitresBloques.length">
        <h4>Titres en attente de la DREAL</h4>

        <TableAuto
          class="mb-xxl"
          :columns="columns.slice(0, 4)"
          :rows="item.drealTitresBloques"
          :initialSort="{ column: initialColumnId, order: 'asc' }"
        />
      </template>
      <h4>Titres en cours d’instruction</h4>
      <TableAuto
        :columns="columns"
        :rows="item.drealTitres"
        :initialSort="{ column: initialColumnId, order: 'asc' }"
        class="width-full-p"
      />
    </LoadingElement>
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
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { AsyncData } from '@/api/client-rest'

const data = ref<
  AsyncData<{ drealTitres: TableAutoRow[]; drealTitresBloques: TableAutoRow[] }>
>({ status: 'LOADING' })
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
    data.value = {
      status: 'LOADED',
      value: {
        drealTitres: titresLignesBuild(
          titres.filter(titre => !titre.enAttenteDeDREAL)
        ),
        drealTitresBloques: titresLignesBuild(
          titres.filter(titre => titre.enAttenteDeDREAL)
        )
      }
    }
  } catch (e: any) {
    console.log('error', e)
    data.value = {
      status: 'ERROR',
      message: e.message ?? "Une erreur s'est produite"
    }
  }
})
</script>
