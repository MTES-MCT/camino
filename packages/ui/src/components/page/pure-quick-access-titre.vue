<template>
  <SimpleTypeahead
    id="quick-access-titre"
    placeholder="Rechercher un titre"
    type="single"
    :items="titres"
    :overrideItems="overrideItems"
    :minInputLength="3"
    :itemKey="item => item.id"
    :itemChipLabel="item => item.nom"
    @selectItem="selectItem"
    @onInput="debounce(() => emit('onSearch', $event))"
  >
    <template #default="{ item }">
      <div class="flex flex-center">
        <Domaine :domaineId="item.domaine.id" class="mr-s" />
        <span class="cap-first bold">
          {{ item.nom }}
        </span>
        <span class="ml-xs"> ({{ titreTypeGetById(item.type.type.id) }}) </span>
      </div>
    </template>
  </SimpleTypeahead>
</template>

<script setup lang="ts">
import SimpleTypeahead from '@/components/_ui/typeahead.vue'
import { Titre } from './pure-quick-access-titres.type'
import Domaine from '@/components/_common/domaine.vue'
import {
  TitresTypesTypes,
  TitreTypeTypeId
} from 'camino-common/src/static/titresTypesTypes'
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'onSelectedTitre', titre: Titre | undefined): void
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

const overrideItems = ref<Titre[]>([])
const selectItem = (item: Titre | undefined) => {
  overrideItems.value = []
  emit('onSelectedTitre', item)
}

const titreTypeGetById = (id: TitreTypeTypeId) => TitresTypesTypes[id].nom

const debounce = createDebounce()

defineProps<{
  titres: Titre[]
}>()
</script>
