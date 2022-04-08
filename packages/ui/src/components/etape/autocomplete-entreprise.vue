<template>
  <div>
    <div v-for="entity in mySelectedEntities || []" :key="entity.id">
      <div class="flex mb-s flex-center">
        <div class="h4" style="flex: 0 1 15em">
          {{ entity.nom }}
        </div>

        <label style="flex: auto; user-select: none">
          <input
            :checked="entity.operateur"
            type="checkbox"
            class="mr-xs"
            @change="toggleOperator(entity)"
          />
          Opérateur
        </label>

        <button
          class="btn py-s px-m rnd-xs"
          style=""
          @click="removeEntity(entity)"
        >
          <i class="icon-24 icon-minus" />
        </button>
      </div>
    </div>
    <Typeahead
      id="autocomplete_entreprise"
      :placeholder="placeholder"
      type="single"
      :items="selectableEntities"
      :override-items="overrideItems"
      :min-input-length="3"
      :item-chip-label="item => item.nom"
      :item-key="item => item.id"
      @selectItem="addEntity"
      @onInput="inputValue = $event"
    >
    </Typeahead>
  </div>
</template>

<script setup lang="ts">
import Typeahead from '@/components/_ui/typeahead.vue'
import { computed, ref, watch, withDefaults } from 'vue'
import { AutoCompleteEntreprise } from '@/components/etape/autocomplete-entreprise.type'

const props = withDefaults(
  defineProps<{
    nonSelectableEntities?: AutoCompleteEntreprise[]
    selectedEntities?: AutoCompleteEntreprise[]
    allEntities: AutoCompleteEntreprise[]
    placeholder: string
  }>(),
  {
    nonSelectableEntities: () => [],
    selectedEntities: () => []
  }
)

const emit = defineEmits<{
  (e: 'onEntreprisesUpdate', entreprises: AutoCompleteEntreprise[]): void
}>()

const overrideItems = ref<AutoCompleteEntreprise[]>([])

const mySelectedEntities = ref<AutoCompleteEntreprise[]>([])
const inputValue = ref<string>('')

watch(
  () => props.selectedEntities,
  entities => {
    mySelectedEntities.value = entities.map(entity => ({ ...entity }))
  },
  { immediate: true, deep: true }
)

const selectableEntities = computed(() =>
  props.allEntities
    .filter(
      entity =>
        !props.nonSelectableEntities.some(
          nonSelectableEntity => nonSelectableEntity.id === entity.id
        )
    )
    .filter(
      entity =>
        !mySelectedEntities.value.some(
          mySelectedEntitiy => mySelectedEntitiy.id === entity.id
        )
    )
    .filter(entity =>
      entity.nom.toLowerCase().includes(inputValue.value.toLowerCase())
    )
)

const addEntity = (entity: AutoCompleteEntreprise) => {
  if (entity) {
    mySelectedEntities.value.push(entity)
    overrideItems.value = []

    emit('onEntreprisesUpdate', mySelectedEntities.value)
  }
}

const removeEntity = (entity: AutoCompleteEntreprise) => {
  mySelectedEntities.value = mySelectedEntities.value.filter(
    e => e.id !== entity.id
  )
  emit('onEntreprisesUpdate', mySelectedEntities.value)
}

const toggleOperator = (entity: AutoCompleteEntreprise) => {
  entity.operateur = !entity.operateur
  emit('onEntreprisesUpdate', mySelectedEntities.value)
}
</script>
