<template>
  <PureEntrepriseDashboard
    v-if="hasEntreprises"
    :getEntreprisesTitres="getEntreprisesTitres"
    :displayActivites="activites"
  />
  <PureONFDashboard v-else-if="isONF" :getOnfTitres="getOnfTitres" />
  <PurePTMGDashboard v-else-if="isPTMG" :getPtmgTitres="getPtmgTitres" />
  <PureDREALDashboard
    v-else-if="isDREAL || isDGTM"
    :getDrealTitres="getDrealTitres"
    :isDGTM="isDGTM"
    :getDgtmStats="getDgtmStats"
  />
  <div v-else>Loading</div>
</template>

<script setup lang="ts">
import PureEntrepriseDashboard from '@/components/dashboard/pure-entreprise-dashboard.vue'
import PureONFDashboard from '@/components/dashboard/pure-onf-dashboard.vue'
import PurePTMGDashboard from '@/components/dashboard/pure-ptmg-dashboard.vue'
import PureDREALDashboard from '@/components/dashboard/pure-dreal-dashboard.vue'

import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { titres } from '@/api/titres'

const store = useStore()
const router = useRouter()

const user = store.state.user.element
const activites: boolean = user?.sections?.activites ?? false

const entreprisesIds: string[] = []
const hasEntreprises: boolean = store.getters['user/hasEntreprises']

const isONF: boolean = store.getters['user/isONF']
const isPTMG: boolean = store.getters['user/isPTMG']
const isDREAL: boolean = store.getters['user/isDREAL']
const isDGTM: boolean = store.getters['user/isDGTM']
if (hasEntreprises) {
  // TODO 2022-03-17: type the store
  const entreprises = store.getters['user/user']?.entreprises ?? []
  entreprisesIds.push(
    ...entreprises.map((entreprise: { id: string }) => entreprise.id)
  )
} else if (!isONF && !isPTMG && !isDREAL && !isDGTM) {
  store.commit('titres/reset')
  store.dispatch('titres/init')
  router.replace({ name: 'titres' })
}

const getEntreprisesTitres = async () => {
  return (await titres({ entreprisesIds })).elements
}

const getOnfTitres = async () => (await fetch('/apiUrl/titresONF')).json()
const getPtmgTitres = async () => (await fetch('/apiUrl/titresPTMG')).json()
const getDrealTitres = async () => (await fetch('/apiUrl/titresDREAL')).json()
const getDgtmStats = async () => (await fetch('/apiUrl/statistiques')).json()
</script>
