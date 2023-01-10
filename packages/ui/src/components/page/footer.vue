<template>
  <PureFooter :version="version" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PureFooter } from './pure-footer'
import { useStore } from 'vuex'

const store = useStore()
const version = computed(() => {
  /* global applicationVersion */
  // @ts-ignore
  return applicationVersion
})
// const displayNewsletter = computed(() => {
//   return !store.state.user.element
// })
</script>
