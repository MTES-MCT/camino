<template>
  <Loader v-if="!statistiques" class="content" />
  <div v-else class="content">
    <PureGlobales :statistiques="statistiques" />
  </div>
</template>

<script setup lang="ts">
import Loader from '../_ui/loader.vue'
import PureGlobales from './pure-globales.vue'
import { statistiquesGlobales } from '@/api/statistiques'
import { onMounted, ref } from 'vue'
import { Statistiques } from 'camino-common/src/statistiques'

const statistiques = ref<Statistiques | null>(null)

onMounted(async () => {
  try {
    statistiques.value = await statistiquesGlobales()
  } catch (e) {}
})
</script>
