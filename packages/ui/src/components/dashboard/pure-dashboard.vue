<template>
  <div>
    <div class="desktop-blobs">
      <div class="desktop-blob-2-3">
        <h1 class="mt-xs mb-m">Mes Titres</h1>
      </div>

      <div class="desktop-blob-1-3">
        <button class="btn btn-primary small flex" @click="titreDemandeOpen">
          <span class="mt-xxs">Demander un titre…</span>
          <i class="icon-24 icon-plus flex-right" />
        </button>
      </div>
    </div>
    <div v-if="status === 'LOADING'" class="loaders fixed p">
      <div class="loader" />
    </div>
    <TableAuto
      v-if="status === 'LOADED'"
      :columns="columns"
      :rows="entrepriseTitres"
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
import Error from '@/components/error.vue'
import {
  titresColonnes,
  titresLignesBuild
} from '@/components/titres/table-utils'
import { Row } from '../_ui/table-auto.type'
import { useRouter } from 'vue-router'

const status = ref<'LOADING' | 'LOADED' | 'ERROR'>('LOADING')
const entrepriseTitres = ref<Row[]>([])
const props = defineProps<{
  // TODO 2022-03-22: type the graphql
  getEntreprisesTitres: () => Promise<unknown[]>
  displayActivites: boolean
}>()

const columns = titresColonnes.filter(({ id }) =>
  props.displayActivites ? true : id !== 'activites'
)

const router = useRouter()

const titreDemandeOpen = () => {
  router.push({ name: 'titre-creation' })
}

onMounted(async () => {
  try {
    const entreprises = await props.getEntreprisesTitres()
    entrepriseTitres.value.push(
      ...titresLignesBuild(entreprises, props.displayActivites)
    )
    status.value = 'LOADED'
  } catch (e) {
    status.value = 'ERROR'
  }
})
</script>
