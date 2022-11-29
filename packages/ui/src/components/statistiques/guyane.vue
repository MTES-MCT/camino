<template>
  <PureGuyane :getStats="getStats" />
</template>

<script setup lang="ts">
import { fetchWithJson } from '@/api/client-rest'
import { statistiquesGuyane } from '@/api/statistiques'
import { CaminoAnnee } from 'camino-common/src/date'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import {
  StatistiquesGuyaneGraphQL,
  StatistiquesGuyane
} from 'camino-common/src/statistiques'
import PureGuyane from './pure-guyane.vue'

const getStats = async (): Promise<StatistiquesGuyane> => {
  const guyane = await statistiquesGuyane()
  return {
    rest: await fetchWithJson(CaminoRestRoutes.statistiquesGuyane, {}),
    graphql: guyane,
    statistiques: guyane.annees.reduce(
      (
        acc: Record<CaminoAnnee, StatistiquesGuyaneGraphQL>,
        statsAnnee: StatistiquesGuyaneGraphQL
      ) => {
        acc[statsAnnee.annee] = statsAnnee

        return acc
      },
      {}
    )
  }
}
</script>
