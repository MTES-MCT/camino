<template>
  <SimpleTypeahead
    id="quick-access-titre"
    placeholder="Rechercher un titre"
    :items="titres"
    :min-input-length="3"
    @selectItem="emit('onSelectedTitre', $event)"
    @onInput="debounce(() => emit('onSearch', $event))"
  >
    <template #default="{ item }">
      <div class="flex flex-center">
        <Domaine :domaine-id="item.domaine.id" class="mr-s" />
        <span class="cap-first bold">
          {{ item.nom }}
        </span>
        <span class="ml-xs"> ({{ titreTypeGetById(item.type.type.id) }}) </span>
      </div>
    </template>
  </SimpleTypeahead>
</template>

<script setup lang="ts">
import SimpleTypeahead from '@/components/_ui/simple-typeahead.vue'
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
</script>
