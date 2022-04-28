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
      :initialSort="{ column: 'statut', order: 'asc' }"
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
import { Column, TableAutoRow } from '../_ui/table-auto.type'
import Error from '@/components/error.vue'
import {
  Entreprise,
  nomColumn,
  referencesColumn,
  statutColumn,
  titresLignesBuild,
  titulairesColumn
} from '@/components/titres/table-utils'

const status = ref<'LOADING' | 'LOADED' | 'ERROR'>('LOADING')
const onfTitres = ref<TableAutoRow[]>([])
const props = defineProps<{
  // TODO 2022-03-22: type the graphql
  getOnfTitres: () => Promise<Entreprise[]>
  displayActivites: boolean
}>()

const columns: Column[] = [
  nomColumn,
  statutColumn,
  referencesColumn,
  titulairesColumn
]

onMounted(async () => {
  try {
    const titres = await props.getOnfTitres()
    onfTitres.value.push(...titresLignesBuild(titres, props.displayActivites))
    status.value = 'LOADED'
  } catch (e) {
    status.value = 'ERROR'
  }
})
</script>
