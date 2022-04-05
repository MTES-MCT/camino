<template>
  <CommonDeposePopup @on-depose="depose"></CommonDeposePopup>
</template>

<script setup lang="ts">
import CommonDeposePopup from '../_common/depose-popup.vue'
import { useStore } from 'vuex'

const props = defineProps<{
  etape: any
  onDepotDone: () => void
}>()

const store = useStore()

const depose = async () => {
  await store.dispatch('titreEtape/depose', {
    id: props.etape.id
  })
  props.onDepotDone()
}
</script>
