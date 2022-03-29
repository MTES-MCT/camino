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
      <div class="flex flex-center">
        <Domaine :domaine-id="slot.item.domaine.id" class="mr-s" />
        <span class="cap-first bold">
          {{ slot.itemProjection(slot.item) }}
        </span>
        <span class="ml-xs">
          ({{ titreTypeGetById(slot.item.type.type.id) }})
        </span>
      </div>
    </template>
  </SimpleTypeahead>
</template>

<script setup lang="ts">
import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css'
// @ts-ignore
import SimpleTypeahead from 'vue3-simple-typeahead'
import { Titre } from './pure-quick-access-titres.type'
import Domaine from '@/components/_common/domaine.vue'
import {
  TitresTypesTypes,
  TitresTypesTypesId
} from 'camino-common/src/titresTypesTypes'

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

const titreTypeGetById = (id: TitresTypesTypesId) => TitresTypesTypes[id].nom

const debounce = createDebounce()

defineProps<{
  titres: Titre[]
}>()

const itemProjection = (item: Titre) => item.nom
</script>
