<template>
  <div>
    <div v-for="entity in mySelectedEntities || []" :key="entity.id">
      <div class="flex mb-s flex-center">
        <div class="h4" style="flex: 0 1 15em">
          {{ getEntrepriseNom(entity) }}
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
          <Icon name="minus" size="M" />
        </button>
      </div>
    </div>
    <Typeahead
      id="autocomplete_entreprise"
      :placeholder="placeholder"
      type="single"
      :items="selectableEntities"
      :overrideItems="overrideItems"
      :minInputLength="2"
      :itemChipLabel="item => item.nom"
      :itemKey="item => item.id"
      @selectItem="addEntity"
      @onInput="inputValue = $event"
    >
    </Typeahead>
  </div>
</template>

<script setup lang="ts">
import Typeahead from '@/components/_ui/typeahead.vue'
import { computed, ref, watch, withDefaults } from 'vue'
import Icon from '@/components/_ui/icon.vue'
import { EtapeEntreprise } from 'camino-common/src/etape'
import { EntrepriseId, Entreprise } from 'camino-common/src/entreprise'

const props = withDefaults(
  defineProps<{
    nonSelectableEntities?: EntrepriseId[]
    selectedEntities?: EtapeEntreprise[]
    allEntities: Entreprise[]
    placeholder: string
  }>(),
  {
    nonSelectableEntities: () => [],
    selectedEntities: () => []
  }
)

const emit = defineEmits<{
  (e: 'onEntreprisesUpdate', entreprises: EtapeEntreprise[]): void
}>()

const overrideItems = ref<{ id: EntrepriseId }[]>([])

const mySelectedEntities = ref<EtapeEntreprise[]>([])
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
    .filter(entity => !props.nonSelectableEntities.some(id => id === entity.id))
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

const addEntity = (entity: Entreprise | undefined) => {
  if (entity) {
    mySelectedEntities.value.push({ id: entity.id, operateur: false })
    overrideItems.value = []

    emit('onEntreprisesUpdate', mySelectedEntities.value)
  }
}

const removeEntity = (entity: EtapeEntreprise) => {
  mySelectedEntities.value = mySelectedEntities.value.filter(
    e => e.id !== entity.id
  )
  emit('onEntreprisesUpdate', mySelectedEntities.value)
}

const toggleOperator = (entity: EtapeEntreprise) => {
  entity.operateur = !entity.operateur
  emit('onEntreprisesUpdate', mySelectedEntities.value)
}

const getEntrepriseNom = (entity: EtapeEntreprise) =>
  props.allEntities.find(({ id }) => id === entity.id)?.nom ?? ''
</script>
