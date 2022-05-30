<template>
  <div style="position: relative">
    <slot v-if="data.status === 'LOADED'" :item="data.value" />
    <div v-else-if="data.status === 'ERROR'" class="color-error">
      {{ data.message }}
    </div>
    <div v-else class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
import { AsyncData } from '@/api/client-rest'

defineProps<{ data: AsyncData<any> }>()
</script>
<style scoped>
@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  position: absolute;
  box-sizing: border-box;
  top: 50%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--dsfr-bf500);
  border-bottom-color: var(--dsfr-bf500);
  animation: spinner 0.8s ease infinite;
}
</style>
