<template>
  <PureMetauxMinerauxMetropole :getStats="getStats" />
</template>

<script setup lang="ts">
import { fetchWithJson } from '@/api/client-rest'
import { StatistiquesMetauxMinerauxMetropole } from 'camino-common/src/statistiques'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import PureMetauxMinerauxMetropole from './pure-metaux-mineraux-metropole.vue'

const getStats = async () =>
  fetchWithJson<StatistiquesMetauxMinerauxMetropole>(
    CaminoRestRoutes.statistiquesMetauxMinerauxMetropole
  )
</script>
