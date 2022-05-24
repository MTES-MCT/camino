<template>
  <PureEntrepriseDashboard
    v-if="hasEntreprises"
    :getEntreprisesTitres="getEntreprisesTitres"
    :displayActivites="activites"
  />
  <PureONFDashboard
    v-else-if="isONF"
    :getOnfTitres="getOnfTitres"
    :displayActivites="false"
  />
  <div v-else>Loading</div>
</template>

<script setup lang="ts">
import PureEntrepriseDashboard from '@/components/dashboard/pure-entreprise-dashboard.vue'
import PureONFDashboard from '@/components/dashboard/pure-onf-dashboard.vue'

import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { titres } from '@/api/titres'
import { ADMINISTRATION_IDS } from 'camino-common/src/administrations'
import { DOMAINES_IDS } from 'camino-common/src/domaines'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/titresTypesTypes'

const store = useStore()
const router = useRouter()

const user = store.state.user.element
const activites = user?.sections?.activites ?? false

const entreprisesIds: string[] = []
const hasEntreprises: boolean = store.getters['user/hasEntreprises']

const isONF: boolean =
  store.getters['user/userIsAdmin'] &&
  user.administrations.find(
    ({ id }: { id: string }) =>
      id === ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
  )
if (hasEntreprises) {
  // TODO 2022-03-17: type the store
  const entreprises = store.getters['user/user']?.entreprises ?? []
  entreprisesIds.push(
    ...entreprises.map((entreprise: { id: string }) => entreprise.id)
  )
} else if (!isONF) {
  store.commit('titres/reset')
  store.dispatch('titres/init')
  router.push({ name: 'titres' })
}

const getEntreprisesTitres = async () => {
  return (await titres({ entreprisesIds })).elements
}

const getOnfTitres = async () => (await fetch('/apiUrl/titresONF')).json()
</script>
