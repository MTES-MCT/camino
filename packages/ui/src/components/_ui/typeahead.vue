<template>
  <div :id="wrapperId" class="typeahead">
    <div class="flex typeahead-wrapper p-xs">
      <template v-if="type === 'multiple'">
        <Chip
          v-for="item in selectedItems"
          :key="itemKey(item)"
          :nom="itemChipLabel(item)"
          class="mr-xs mb-xs mt-xs"
          @onDelete="unselectItem(item)"
        />
      </template>
      <input
        :id="id"
        ref="myTypeaheadInput"
        v-model="input"
        class="typeahead-input"
        type="text"
        :placeholder="placeholder"
        autocomplete="off"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keyup.enter.prevent="selectCurrentSelection"
        @keydown.delete="deleteLastSelected"
      />
    </div>

    <div v-if="isListVisible" class="typeahead-list">
      <div
        v-for="(item, index) in notSelectedItems"
        :key="index"
        class="typeahead-list-item"
        :class="{
          'typeahead-list-item-active': currentSelectionIndex === index
        }"
        @mousedown.prevent
        @click="selectItem(item)"
        @mouseenter="currentSelectionIndex = index"
      >
        <span class="typeahead-list-item-text">
          <slot :item="item">
            {{ itemChipLabel(item) }}
          </slot>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="K, T extends K">
import { computed, Ref, ref, watch, withDefaults } from 'vue'
import { Chip } from './chip'

export type Props<K, T extends K> = {
  id?: string
  placeholder: string
  type: 'single' | 'multiple'
  items: T[]
  overrideItems?: K[]
  minInputLength: number
  itemChipLabel: (key: T) => string
  itemKey: (key: K) => string
}

const getItems = (items: K[]): T[] =>
  items
    .map(o => props.items.find(i => props.itemKey(i) === props.itemKey(o)))
    .filter((o): o is T => !!o)

const myTypeaheadInput = ref<HTMLInputElement | null>(null)

const props = withDefaults(defineProps<Props<K, T>>(), {
  overrideItems: () => [],
  id: `typeahead_${(Math.random() * 1000).toFixed()}`
})

const emit = defineEmits<{
  (e: 'onInput', searchTerm: string): void
  (e: 'selectItems', items: T[]): void
  (e: 'selectItem', item: T | undefined): void
}>()

watch(
  () => props.overrideItems,
  newItems => {
    selectedItems.value = getItems(newItems)
  },
  { deep: true }
)
const selectedItems = ref<T[]>(getItems(props.overrideItems)) as Ref<T[]>
const input = ref<string>(
  props.type === 'single' && props.overrideItems?.length
    ? props.itemChipLabel(getItems(props.overrideItems)[0])
    : ''
)
const isInputFocused = ref<boolean>(false)
const currentSelectionIndex = ref<number>(0)

const onInput = () => {
  if (
    isListVisible.value &&
    currentSelectionIndex.value >= props.items.length
  ) {
    currentSelectionIndex.value = (props.items.length || 1) - 1
  }
  emit('onInput', input.value)
}
const onFocus = () => {
  isInputFocused.value = true
}
const onBlur = () => {
  isInputFocused.value = false
}
const onArrowDown = () => {
  if (
    isListVisible.value &&
    currentSelectionIndex.value < props.items.length - 1
  ) {
    currentSelectionIndex.value++
  }
  scrollSelectionIntoView()
}
const onArrowUp = () => {
  if (isListVisible.value && currentSelectionIndex.value > 0) {
    currentSelectionIndex.value--
  }
  scrollSelectionIntoView()
}
const scrollSelectionIntoView = () => {
  setTimeout(() => {
    const listNode = document.querySelector<HTMLElement>(
      `#${wrapperId.value} .typeahead-list`
    )
    const activeNode = document.querySelector<HTMLElement>(
      `#${wrapperId.value} .typeahead-list-item.typeahead-list-item-active`
    )

    if (listNode && activeNode) {
      if (
        !(
          activeNode.offsetTop >= listNode.scrollTop &&
          activeNode.offsetTop + activeNode.offsetHeight <
            listNode.scrollTop + listNode.offsetHeight
        )
      ) {
        let scrollTo = 0
        if (activeNode.offsetTop > listNode.scrollTop) {
          scrollTo =
            activeNode.offsetTop +
            activeNode.offsetHeight -
            listNode.offsetHeight
        } else if (activeNode.offsetTop < listNode.scrollTop) {
          scrollTo = activeNode.offsetTop
        }

        listNode.scrollTo(0, scrollTo)
      }
    }
  })
}
const selectCurrentSelection = (event: KeyboardEvent) => {
  if (currentSelection.value) {
    selectItem(currentSelection.value)
    event.stopPropagation()
  }

  if (props.type === 'multiple') {
    myTypeaheadInput?.value?.focus?.()
  }
}

const deleteLastSelected = () => {
  if (input.value === '') {
    selectedItems.value.pop()
    emit('selectItems', selectedItems.value)
  }
}

const selectItem = (item: T) => {
  if (props.type === 'multiple') {
    input.value = ''
  } else {
    input.value = props.itemChipLabel(item)
  }
  currentSelectionIndex.value = 0
  document.getElementById(props.id)?.blur()

  if (props.type === 'multiple') {
    selectedItems.value.push(item)
  } else {
    selectedItems.value = [item]
  }

  emit('selectItem', item)
  emit('selectItems', selectedItems.value)
}

const unselectItem = (item: T) => {
  const itemKey = props.itemKey(item)
  selectedItems.value = selectedItems.value.filter(
    i => props.itemKey(i) !== itemKey
  )
  emit('selectItems', selectedItems.value)
  emit('selectItem', undefined)
}

const wrapperId = computed(() => `${props.id}_wrapper`)
const isListVisible = computed(
  () =>
    isInputFocused.value &&
    input.value.length >= props.minInputLength &&
    props.items.length
)

const currentSelection = computed(() => {
  return isListVisible.value &&
    currentSelectionIndex.value < notSelectedItems.value.length
    ? notSelectedItems.value[currentSelectionIndex.value]
    : undefined
})

const notSelectedItems = computed(() => {
  const selectItemKeys = selectedItems.value.map(i => props.itemKey(i))
  return props.items.filter(
    item => !selectItemKeys.includes(props.itemKey(item))
  )
})
</script>

<style scoped>
.typeahead {
  position: relative;
  width: 100%;
}
.typeahead-wrapper {
  border: 0 none;
  background-color: var(--color-alt);
  height: auto;
  color: inherit;
  box-shadow: 0 2px 0 0 var(--dsfr-g600);
  flex-wrap: wrap;
}
.typeahead-input {
  margin-bottom: 0;

  width: auto;
  flex-grow: 1;
  appearance: none;
  border: 0;
  box-shadow: 0 0 0 0 !important;
}

.typeahead-input:focus {
  border-right: 0 !important;
}

.typeahead .typeahead-list {
  position: absolute;
  width: 100%;
  border: none;
  max-height: 400px;
  overflow-y: auto;
  border-bottom: 0.1rem solid #d1d1d1;
  z-index: 9;
}
.typeahead .typeahead-list .typeahead-list-item {
  cursor: pointer;
  background-color: #fafafa;
  padding: 0.6rem 1rem;
  border-bottom: 0.1rem solid #d1d1d1;
  border-left: 0.1rem solid #d1d1d1;
  border-right: 0.1rem solid #d1d1d1;
}

.typeahead .typeahead-list .typeahead-list-item:last-child {
  border-bottom: none;
}

.typeahead .typeahead-list .typeahead-list-item.typeahead-list-item-active {
  background-color: #e1e1e1;
}
</style>
