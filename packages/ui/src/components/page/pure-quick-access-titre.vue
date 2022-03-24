<template>
  <SimpleTypeahead
    id="quick-access-titre"
    placeholder="Navigation rapide des titres"
    :items="titres"
    :item-projection="itemProjection"
    :min-input-length="3"
    @selectItem="emit('onSelectedTitre', $event)"
    @onInput="debounce(() => emit('onSearch', $event.input))"
  >
    <template #list-item-text="slot">
      <h4 class="mb">
        <Domaine :domaine-id="slot.item.domaine.id" class="mr-s" /><span
          class="cap-first"
          >{{ slot.itemProjection(slot.item) }}</span
        >
      </h4>
    </template>
  </SimpleTypeahead>
</template>

<script setup lang="ts">
import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css'
// @ts-ignore
import SimpleTypeahead from 'vue3-simple-typeahead'
import { Titre } from './pure-quick-access-titres.type'
import Domaine from '@/components/_common/domaine.vue'

const emit = defineEmits<{
  (e: 'onSelectedTitre', titre: Titre): void
  (e: 'onSearch', searchTerm: string): void
}>()

const createDebounce = () => {
  let timeout: ReturnType<typeof setTimeout>
  return function (fnc: Function, delayMs = 500) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fnc()
    }, delayMs)
  }
}

const debounce = createDebounce()

defineProps<{
  titres: Titre[]
}>()

const itemProjection = (item: Titre) => item.nom
</script>
