<template>
  <Pill :color="`bg-${color}`">
    {{ nom }}
  </Pill>
</template>

<script setup lang="ts">
import { Pill } from '../_ui/pill'
import { withDefaults } from 'vue'

withDefaults(
  defineProps<{
    color?:
      | 'neutral'
      | 'error'
      | 'info'
      | 'neutral'
      | 'success'
      | 'warning'
      | 'domaine-c'
      | 'domaine-f'
      | 'domaine-g'
      | 'domaine-h'
      | 'domaine-i'
      | 'domaine-m'
      | 'domaine-r'
      | 'domaine-s'
      | 'domaine-w'
    nom?: string
  }>(),
  { color: 'neutral', nom: 'indéfini' }
)
</script>
