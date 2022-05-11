<template>
  <Loader v-if="!loaded" class="content" />
  <div v-else class="content">
    <PureGlobales :statistiques="statistiques" />
  </div>
</template>

<script setup lang="ts">
import Loader from '../_ui/loader.vue'
import PureGlobales from './pure-globales.vue'
import { statistiquesGlobales } from '@/api/statistiques'
import { onMounted, ref } from 'vue'

const loaded = ref(false)
const statistiques = ref(null)

onMounted(async () => {
  try {
    statistiques.value = await statistiquesGlobales()
    loaded.value = true
  } catch (e) {}
})
</script>
