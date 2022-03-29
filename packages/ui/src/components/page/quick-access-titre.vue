<template>
  <PureQuickAccessTitre
    :titres="titres"
    @onSearch="search"
    @onSelectedTitre="onSelectedTitre"
  />
</template>

<script setup lang="ts">
import PureQuickAccessTitre from './pure-quick-access-titre.vue'
import { titresRechercher } from '@/api/titres'
import { useRouter } from 'vue-router'
import { Titre } from '@/components/page/pure-quick-access-titres.type'
import { ref } from 'vue'

const router = useRouter()
const titres = ref<Titre[]>([])

const search = async (searchTerm: string): Promise<void> => {
  const searchTitres = await titresRechercher({
    intervalle: 10,
    noms: searchTerm
  })
  titres.value.splice(0, titres.value.length, ...searchTitres.elements)
}

const onSelectedTitre = (titre: Titre) => {
  router.push({ name: 'titre', params: { id: titre.id } })
}
</script>

<style scoped></style>
