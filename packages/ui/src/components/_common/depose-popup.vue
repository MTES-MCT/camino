<template>
  <Popup :messages="messages">
    <template #header>
      <h2>Dépôt</h2>
    </template>

    <p class="bold">Souhaitez vous effectuer le dépôt ?</p>
    <div class="bg-warning color-bg p-s mb-l">
      <span class="bold"> Attention </span>: cette opération est définitive et
      ne peut pas être annulée.
    </div>

    <template #footer>
      <div v-if="!loading" class="tablet-blobs">
        <div class="tablet-blob-1-3 mb tablet-mb-0">
          <button class="btn-border rnd-xs p-s full-x" @click="cancel">
            Annuler
          </button>
        </div>
        <div class="tablet-blob-2-3">
          <button class="btn btn-primary" @click="depose">Déposer</button>
        </div>
      </div>
      <div v-else class="p-s full-x bold">Dépôt en cours…</div>
    </template>
  </Popup>
</template>

<script setup lang="ts">
import Popup from '../_ui/popup.vue'
import { computed, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'

const emits = defineEmits<{
  (e: 'onDepose'): void
}>()

const store = useStore()

const loading = computed(() => store.state.popup.loading)
const messages = computed(() => store.state.popup.messages)

const depose = () => {
  emits('onDepose')
}

const cancel = () => {
  errorsRemove()
  store.commit('popupClose')
}

const errorsRemove = () => {
  store.commit('popupMessagesRemove')
}

const keyup = (e: KeyboardEvent) => {
  if (e.code === 'Escape') {
    cancel()
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('keyup', keyup)
})

document.addEventListener('keyup', keyup)
</script>
