<template>
  <PureGuyane :getStats="getStats" />
</template>

<script setup lang="ts">
import { fetchWithJson } from '@/api/client-rest'
import { CaminoAnnee } from 'camino-common/src/date'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import {
  StatistiquesGuyane,
  StatistiquesGuyaneActivite,
  StatistiquesGuyaneData
} from 'camino-common/src/statistiques'
import PureGuyane from './pure-guyane.vue'

const getStats = async (): Promise<StatistiquesGuyane> => {
  const data: StatistiquesGuyaneData = await fetchWithJson(
    CaminoRestRoutes.statistiquesGuyane,
    {}
  )
  return {
    data,
    parAnnee: data.annees.reduce(
      (
        acc: Record<CaminoAnnee, StatistiquesGuyaneActivite>,
        statsAnnee: StatistiquesGuyaneActivite
      ) => {
        acc[statsAnnee.annee] = statsAnnee

        return acc
      },
      {}
    )
  }
}
</script>
