<template>
  <PureDgtmStatsFull :getDgtmStats="getDgtmStats" />
</template>

<script setup lang="ts">
import { fetchWithJson } from '@/api/client-rest'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import PureDgtmStatsFull from './pure-dgtm-stats-full.vue'
const getDgtmStats = async (): Promise<StatistiquesDGTM> =>
  fetchWithJson(CaminoRestRoutes.statistiquesDGTM, {})
</script>
