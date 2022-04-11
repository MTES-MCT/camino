<template>
  <button :class="color" class="chip pl-m pr-m" @click="emit('onDelete')">
    {{ nom }} <span>x</span>
  </button>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue'

withDefaults(
  defineProps<{
    color?: string
    nom: string
  }>(),
  { color: 'bg-neutral' }
)

const emit = defineEmits<{
  (e: 'onDelete'): void
}>()
</script>

<style scoped>
.chip {
  cursor: pointer;
  border: 0;
  white-space: nowrap;

  border-radius: var(--unit-infinity);
  box-decoration-break: clone;
}
.chip:hover {
  filter: brightness(0.8);
}
</style>
