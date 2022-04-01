<template>
  <PureQuickAccessTitre
    :titres="titres"
    @onSearch="search"
    @onSelectedTitre="onSelectedTitre"
  />
</template>

<script setup lang="ts">
import PureQuickAccessTitre from './pure-quick-access-titre.vue'
import {
  titresRechercherByNom,
  titresRechercherByReferences
} from '@/api/titres'
import { useRouter } from 'vue-router'
import { Titre } from '@/components/page/pure-quick-access-titres.type'
import { ref, inject } from 'vue'

const router = useRouter()
const titres = ref<Titre[]>([])

const matomo = inject('matomo', null)
const search = async (searchTerm: string): Promise<void> => {
  const intervalle = 10

  let searchTitres = await titresRechercherByNom({
    intervalle,
    noms: searchTerm
  })

  if (searchTitres.elements.length === 0) {
    searchTitres = await titresRechercherByReferences({
      intervalle,
      references: searchTerm
    })
  }
  titres.value.splice(0, titres.value.length, ...searchTitres.elements)
}

const onSelectedTitre = (titre: Titre) => {
  if (matomo) {
    // @ts-ignore
    matomo.trackEvent('navigation', 'navigation-rapide', titre.id)
  }
  router.push({ name: 'titre', params: { id: titre.id } })
}
</script>

<style scoped></style>
