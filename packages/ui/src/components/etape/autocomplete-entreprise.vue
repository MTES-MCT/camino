<template>
  <div>
    <div v-for="entity in mySelectedEntities || []" :key="entity.id">
      <div class="flex mb-s flex-center">
        <div class="h4" style="flex: 0 1 15em">
          {{ getEntrepriseNom(entity) }}
        </div>

        <label style="flex: auto; user-select: none">
          <input :checked="entity.operateur" type="checkbox" class="mr-xs" @change="toggleOperator(entity)" />
          Opérateur
        </label>

        <button class="btn py-s px-m rnd-xs" style="" @click="removeEntity(entity)">
          <Icon name="minus" size="M" />
        </button>
      </div>
    </div>
    <TypeAhead :props="typeAheadProps" />
  </div>
</template>

<script setup lang="ts">
import { TypeAhead, TypeAheadType } from '@/components/_ui/typeahead'
import { computed, ref, watch, withDefaults } from 'vue'
import { Icon } from '@/components/_ui/icon'
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
    selectedEntities: () => [],
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
    .filter(entity => !mySelectedEntities.value.some(mySelectedEntitiy => mySelectedEntitiy.id === entity.id))
    .filter(entity => entity.nom.toLowerCase().includes(inputValue.value.toLowerCase()))
)

const addEntity = (entity: Entreprise | undefined) => {
  if (entity) {
    mySelectedEntities.value.push({ id: entity.id, operateur: false })
    overrideItems.value = []

    emit('onEntreprisesUpdate', mySelectedEntities.value)
  }
}

const removeEntity = (entity: EtapeEntreprise) => {
  mySelectedEntities.value = mySelectedEntities.value.filter(e => e.id !== entity.id)
  emit('onEntreprisesUpdate', mySelectedEntities.value)
}

const toggleOperator = (entity: EtapeEntreprise) => {
  entity.operateur = !entity.operateur
  emit('onEntreprisesUpdate', mySelectedEntities.value)
}

const getEntrepriseNom = (entity: EtapeEntreprise) => props.allEntities.find(({ id }) => id === entity.id)?.nom ?? ''

const itemKey: keyof Entreprise = 'id'
const type: TypeAheadType = 'single'
const typeAheadProps = {
  id: 'autocomplete_entreprise',
  itemKey,
  placeholder: props.placeholder,
  type,
  items: selectableEntities.value,
  overrideItems: overrideItems.value,
  minInputLength: 2,
  itemChipLabel: (item: Entreprise) => item.nom,
  onSelectItem: addEntity,
  onInput: (event: string) => (inputValue.value = event),
}
</script>
