<template>
  <div>
    <div class="desktop-blobs">
      <div class="desktop-blob-2-3">
        <h1 class="mt-xs mb-xxl">Tableau de bord PTMG</h1>
      </div>
    </div>
    <div v-if="status === 'LOADING'" class="loaders fixed p">
      <div class="loader" />
    </div>
    <div v-if="status === 'LOADED'">
      <template v-if="ptmgTitresBloques.length">
        <div class="line-neutral width-full mb-l"></div>
        <h3>ARM en attente</h3>
        <TableAuto
          class="mb-xxl"
          :columns="columns.slice(0, 5)"
          :rows="ptmgTitresBloques"
          :initialSort="{ column: initialColumnId, order: 'asc' }"
        />
      </template>
      <div class="line-neutral width-full mb-l"></div>
      <h3>ARM en cours d’instruction</h3>
      <TableAuto
        :columns="columns"
        :rows="ptmgTitres"
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
import { CommonTitrePTMG } from 'camino-common/src/titres'

const status = ref<'LOADING' | 'LOADED' | 'ERROR'>('LOADING')
const ptmgTitres = ref<TableAutoRow[]>([])
const ptmgTitresBloques = ref<TableAutoRow[]>([])
const props = defineProps<{
  getPtmgTitres: () => Promise<CommonTitrePTMG[]>
}>()

const columns = [
  nomColumn,
  statutColumn,
  referencesColumn,
  titulairesColumn
] as const

const initialColumnId = columns[1].id

type Columns = typeof columns[number]['id']

const titresLignesBuild = (
  titres: CommonTitrePTMG[]
): TableAutoRow<Columns>[] => {
  return titres.map(titre => {
    const columns: { [key in Columns]: ComponentColumnData | TextColumnData } =
      {
        nom: nomCell(titre),
        statut: statutCell(titre),
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
    const titres = await props.getPtmgTitres()
    ptmgTitres.value.push(
      ...titresLignesBuild(titres.filter(titre => !titre.enAttenteDePTMG))
    )
    ptmgTitresBloques.value.push(
      ...titresLignesBuild(titres.filter(titre => titre.enAttenteDePTMG))
    )
    status.value = 'LOADED'
  } catch (e) {
    console.log('error', e)
    status.value = 'ERROR'
  }
})
</script>
