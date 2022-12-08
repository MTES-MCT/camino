<template>
  <div class="mb p-s color-bg" :class="`bg-${couleur}`">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { Couleur } from 'camino-common/src/static/couleurs'

defineProps<{ couleur: Couleur; message: string }>()
</script>
