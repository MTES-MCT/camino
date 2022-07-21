<template>
  <div class="top-level">
    <template v-if="data.status === 'LOADED'">
      <slot :item="data.value" />
    </template>
    <div v-else-if="data.status === 'ERROR'">
      <HelpTooltip icon="error-warning">
        {{ data.message }}
      </HelpTooltip>
    </div>
    <div v-else class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
import { AsyncData } from '@/api/client-rest'
import HelpTooltip from '@/components/_ui/help-tooltip.vue'

defineProps<{ data: AsyncData<any> }>()
</script>
<style scoped>
.top-level {
  position: relative;
  min-width: var(--unit);
  min-height: var(--unit);
}
@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  position: absolute;
  box-sizing: border-box;
  width: var(--unit);
  height: var(--unit);
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--dsfr-bf500);
  border-bottom-color: var(--dsfr-bf500);
  animation: spinner 0.8s ease infinite;
}
</style>
