<template>
  <svg
    class="component-icon"
    xmlns="http://www.w3.org/2000/svg"
    :width="heightAndWidth"
    :height="heightAndWidth"
    viewBox="0 0 24 24"
    :aria-labelledby="name"
    role="application"
    :fill="computedColor"
    tabindex="-1"
  >
    <IconSprite />
    <use :href="'#icon-' + name" />
  </svg>
</template>

<script setup lang="ts">
import IconSprite from './iconSprite.vue'
import { Icon } from './iconSpriteType'
import { computed } from 'vue'

const props = defineProps<{
  name: Icon
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  color?: string
}>()

const computedColor = computed(() => {
  return props.color ? props.color : '#666'
})

const heightAndWidth = computed(() => {
  switch (props.size) {
    case 'XS':
      return '8px'
    case 'S':
      return '12px'
    case 'M':
      return '16px'
    case 'L':
      return '24px'
    case 'XL':
      return '48px'
    case 'XXL':
      return '128px'
  }
  return '24px'
})
</script>
