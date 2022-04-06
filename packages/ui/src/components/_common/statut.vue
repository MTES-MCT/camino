<template>
  <Pill :color="`bg-${color}`">
    {{ nom }}
  </Pill>
</template>

<script setup lang="ts">
import Pill from '../_ui/pill.vue'
import { withDefaults } from 'vue'

withDefaults(
  defineProps<{
    color?: string
    nom?: string
  }>(),
  { color: 'neutral', nom: 'indéfini' }
)
</script>
