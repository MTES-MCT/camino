<template>
  <div>
    {{ dateValue }}
  </div>
</template>

<script setup lang="ts">
import { dateFormat } from '@/utils'

const props = defineProps<{ date: string }>()

const dateValue = dateFormat(props.date)
</script>
