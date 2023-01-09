<template>
  <div class="mb">
    <h5>{{ filter.name }}</h5>
    <hr class="mb-s" />

    <Typeahead
      :id="'filters_autocomplete_' + filter.name"
      :placeholder="filter.name"
      type="multiple"
      :items="items"
      :overrideItems="overrideItems"
      :minInputLength="filter.lazy ? 3 : 1"
      :itemChipLabel="item => item.nom"
      :itemKey="item => item.id"
      @selectItems="updateHandler"
      @onInput="search"
    />
  </div>
</template>

<script setup lang="ts">
import Typeahead from '@/components/_ui/typeahead.vue'
import { onMounted, ref, watch } from 'vue'
export type Element = { id: string; nom: string }

const props = defineProps<{
  filter: {
    id: string
    value: string[]
    elements: Element[]
    name: string
    lazy: boolean
    type: 'autocomplete'
    search: (input: string) => Promise<{ elements: Element[] }>
    load: (ids: string[]) => Promise<{ elements: Element[] }>
  }
}>()

const emit = defineEmits<{
  (e: 'onSelectItems', items: Element[]): void
}>()

const selectedItems = ref<Element[]>([])
const items = ref<Element[]>(props.filter.elements)
const allKnownItems = ref<Record<string, Element>>({})
const overrideItems = ref<Element[]>([])

watch(
  () => props.filter.value,
  newValues => {
    if (newValues) {
      overrideItems.value =
        newValues
          .map(id => allKnownItems.value[id])
          .filter(
            (elem: Element | undefined): elem is Element => elem !== undefined
          ) ?? []
    }
  },
  { deep: true, immediate: true }
)

onMounted(async () => {
  if (props.filter.lazy && props.filter.value?.length) {
    const result = await props.filter.load(props.filter.value)
    overrideItems.value = result.elements
    for (const element of result.elements) {
      allKnownItems.value[element.id] = element
    }
    // TODO 2022-04-08: ceci est pour le composant parent, pour la traduction notamment (sinon, pour un titreId par exemple, le label est son ID au lieu du nom du titre).
    // C'est étrange, il va falloir corriger tout ça un jour
    props.filter.elements = [...Object.values(allKnownItems.value)]
  }
  for (const element of props.filter.elements) {
    allKnownItems.value[element.id] = element
  }
  // TODO 2022-04-08 des fois, ceci est une chaine vide, des fois un objet. Il faudra supprimer tout ça une fois les composants parents refactorés
  if (Array.isArray(props?.filter?.value)) {
    overrideItems.value = props?.filter?.value
      .map(id => allKnownItems.value[id])
      .filter(
        (elem: Element | undefined): elem is Element => elem !== undefined
      )
  }
})

const updateHandler = (e: Element[]) => {
  selectedItems.value = e
  // TODO 2022-04-08: ceci est pour le composant parent, une fois refactoré, utiliser uniquement le emit
  props.filter.value = e.map(({ id }) => id)
  emit('onSelectItems', e)
}

const search = async (value: string) => {
  if (props.filter.lazy) {
    const result = await props.filter.search(value)
    items.value = [...result.elements]
    for (const element of result.elements) {
      allKnownItems.value[element.id] = element
    }
    // TODO 2022-04-08: ceci est pour le composant parent, pour la traduction notamment (sinon, pour un titreId par exemple, le label est son ID au lieu du nom du titre).
    // C'est étrange, il va falloir corriger tout ça un jour
    props.filter.elements = [...Object.values(allKnownItems.value)]
  } else {
    items.value = props.filter.elements.filter(item =>
      item.nom.toLowerCase().includes(value.toLowerCase())
    )
  }
}
</script>
