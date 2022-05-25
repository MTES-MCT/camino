<template>
  <div class="flex">
    <div
      style="position: relative"
      :style="{ 'margin-left': loaded ? '0' : '10px' }"
    >
      <div v-if="loaded">
        <slot></slot>
      </div>
      <div v-else class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ loaded: boolean }>()
</script>
<style scoped>
@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.spinner:before {
  content: '';
  position: absolute;
  box-sizing: border-box;
  top: 50%;
  left: 0%;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  margin-left: -10px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #07d;
  border-bottom-color: #07d;
  animation: spinner 0.8s ease infinite;
}
</style>
