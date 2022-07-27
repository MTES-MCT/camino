<template>
  <Pill :color="`bg-domaine-${domaineId}`" class="mono">
    {{ domaineId }}
  </Pill>
</template>

<script setup lang="ts">
import Pill from '../_ui/pill.vue'
import { DomaineId, DOMAINES_IDS } from 'camino-common/src/static/domaines'
import { withDefaults } from 'vue'

withDefaults(
  defineProps<{
    domaineId?: DomaineId
  }>(),
  { domaineId: DOMAINES_IDS.METAUX }
)
</script>
