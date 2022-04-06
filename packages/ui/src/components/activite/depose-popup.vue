<template>
  <CommonDeposePopup @on-depose="depose"></CommonDeposePopup>
</template>

<script setup lang="ts">
import CommonDeposePopup from '../_common/depose-popup.vue'
import { useStore } from 'vuex'

const props = defineProps<{
  activite: any
  onDepotDone: () => void
}>()

const store = useStore()

const depose = async () => {
  await store.dispatch('titreActivite/depose', {
    id: props.activite.id
  })
  props.onDepotDone()
}
</script>
