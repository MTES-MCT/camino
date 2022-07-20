<template>
  <PureLoader :data="data">
    <template v-if="data.status === 'LOADED'">
      <slot :item="data.value" />
    </template>
  </PureLoader>
</template>

<script setup lang="ts">
import { AsyncData } from '@/api/client-rest'
import PureLoader from '@/components/_ui/pure-loader.vue'

defineProps<{ data: AsyncData<any> }>()
</script>
