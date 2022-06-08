<template>
  <svg
    style="display: block"
    xmlns="http://www.w3.org/2000/svg"
    :width="heightAndWidth"
    :height="heightAndWidth"
    viewBox="0 0 24 24"
    :aria-labelledby="name"
    role="application"
    :fill="color"
    tabindex="-1"
  >
    <IconSprite />
    <use :href="'#icon-' + name" />
  </svg>
</template>

<script setup lang="ts">
import IconSprite from './iconSprite.vue'
import { Icon } from './iconSpriteType'
import { computed, withDefaults } from 'vue'

const props = withDefaults(
  defineProps<{
    name: Icon
    size: 'S' | 'M' | 'L' | 'XL'
    color?: string
  }>(),
  {
    color: '#666'
  }
)

const heightAndWidth = computed(() => {
  switch (props.size) {
    case 'S':
      return '16px'
    case 'M':
      return '24px'
    case 'L':
      return '48px'
    case 'XL':
      return '128px'
  }
  return '24px'
})
</script>
