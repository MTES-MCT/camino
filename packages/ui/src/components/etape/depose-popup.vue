<template>
  <CommonDeposePopup @on-depose="depose"></CommonDeposePopup>
</template>

<script setup lang="ts">
import CommonDeposePopup from '../_common/depose-popup.vue'
import { useStore } from 'vuex'

const props = defineProps<{
  etapeId: string
  onDepotDone: () => void
}>()

const store = useStore()

const depose = async () => {
  await store.dispatch('titreEtape/depose', props.etapeId)
  props.onDepotDone()
}
</script>
