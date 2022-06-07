<template>
  <div class="tooltip">
    <h6 class="tooltip-content">
      <slot />
    </h6>
    <i class="icon-24" :class="icon ? icon : 'icon-help'" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon?: string }>()
</script>

<style scoped>
.tooltip {
  position: relative;
  width: var(--unit);
}

.tooltip .tooltip-content {
  width: 250px;
  background-color: var(--color-bg);
  color: var(--color-text);
  text-align: center;
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--unit-s);

  position: absolute;
  left: 150%;
  z-index: 1;
  padding: var(--unit-s);
}

.tooltip .tooltip span::after,
.tooltip .tooltip-content {
  visibility: hidden;
}

.tooltip:hover .tooltip span::after,
.tooltip:hover .tooltip-content {
  visibility: visible;
}
</style>
