<template>
  <PureMinerauxMetauxMetropole :getStats="getStats" />
</template>

<script setup lang="ts">
import { fetchWithJson } from '@/api/client-rest'
import { StatistiquesMinerauxMetauxMetropole } from 'camino-common/src/statistiques'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import PureMinerauxMetauxMetropole from './pure-mineraux-metaux-metropole.vue'

const getStats = async () =>
  fetchWithJson<StatistiquesMinerauxMetauxMetropole>(
    CaminoRestRoutes.statistiquesMinerauxMetauxMetropole
  )
</script>
