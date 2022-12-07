<template>
  <div>
    <div class="desktop-blobs">
      <div class="desktop-blob-2-3">
        <h1 class="mt-xs mb-m">Mes Titres</h1>
      </div>

      <div class="desktop-blob-1-3">
        <button class="btn btn-primary small flex" @click="titreDemandeOpen">
          <span class="mt-xxs">Demander un titre…</span>
          <Icon name="plus" size="M" class="flex-right" />
        </button>
      </div>
    </div>

    <LoadingElement v-slot="{ item }" :data="data">
      <div
        v-if="fiscaliteVisible(user, entrepriseId, item)"
        class="p-s bg-info color-bg mb"
      >
        Découvrez l'estimation de votre<router-link
          :to="entrepriseUrl"
          target="_blank"
          class="p-s bg-info color-bg mb"
          >fiscalité minière</router-link
        >
      </div>
      <TableAuto
        :columns="columns"
        :rows="entrepriseTitres(item)"
        :initialSort="{ column: 'statut', order: 'asc' }"
        class="width-full-p"
      />
    </LoadingElement>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TableAuto from '../_ui/table-auto.vue'
import { TableAutoRow } from '../_ui/table-auto.type'
import {
  TitreEntreprise,
  titresColonnes,
  titresLignesBuild
} from '@/components/titres/table-utils'
import { useRouter } from 'vue-router'
import Icon from '@/components/_ui/icon.vue'
import { AsyncData } from '@/api/client-rest'
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { fiscaliteVisible } from 'camino-common/src/fiscalite'
import { User } from 'camino-common/src/roles'
import { EntrepriseId } from 'camino-common/src/entreprise'

const data = ref<AsyncData<TitreEntreprise[]>>({ status: 'LOADING' })

const entrepriseTitres = (entreprises: TitreEntreprise[]): TableAutoRow[] =>
  titresLignesBuild(entreprises, props.displayActivites)
const props = defineProps<{
  user: User
  entrepriseId: EntrepriseId
  // TODO 2022-03-22: type the graphql
  getEntreprisesTitres: () => Promise<TitreEntreprise[]>
  displayActivites: boolean
}>()
const entrepriseUrl = `/entreprises/${props.entrepriseId}`

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
    data.value = { status: 'LOADED', value: entreprises }
  } catch (e: any) {
    data.value = {
      status: 'ERROR',
      message: e.message ?? 'something wrong happened'
    }
  }
})
</script>
