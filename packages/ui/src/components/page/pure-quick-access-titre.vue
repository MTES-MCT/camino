<template>

  <SimpleTypeahead
    id="typeahead_id"
    placeholder="Start writing..."
    :items="titres"
    :itemProjection="itemProjection"
    :minInputLength="1"
    @selectItem="emit('onSelectedTitre', $event)"
    @onInput="emit('onSearch', $event.input)"
  >

    <template #list-item-text="slot">
      <Domaine :domaine-id="slot.item.domaine.id"/><span>{{slot.itemProjection(slot.item)}}</span>
    </template>
  </SimpleTypeahead>
</template>

<script setup lang="ts">
// TODO 2022-03-24 mettre du debounce
import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css';
// @ts-ignore
import SimpleTypeahead from 'vue3-simple-typeahead'
import {Titre} from "./pure-quick-access-titres.type";
import Domaine from "@/components/_common/domaine.vue";


const emit = defineEmits<{
  (e: 'onSelectedTitre', titre: Titre): void
  (e: 'onSearch', searchTerm: string): void
}>()

const props = defineProps<{
  titres: Titre[]
}>()

const itemProjection = (item: Titre) => item.nom

</script>

<style scoped>

</style>
