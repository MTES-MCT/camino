<template>
  <div :id="wrapperId" class="simple-typeahead">
    <div class="flex simple-typeahead-wrapper">
      <Chip
        v-for="item in selectedItems"
        :key="itemKey(item)"
        :nom="itemChipLabel(item)"
        class="mr-xs"
        @onDelete="unselectItem(item)"
      />

      <input
        :id="inputId"
        v-model="input"
        class="simple-typeahead-input"
        type="text"
        :placeholder="placeholder"
        autocomplete="off"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.enter.tab.prevent="selectCurrentSelection"
      />
    </div>

    <div v-if="isListVisible" class="simple-typeahead-list">
      <div
        v-for="(item, index) in notSelectedItems"
        :key="index"
        class="simple-typeahead-list-item"
        :class="{
          'simple-typeahead-list-item-active': currentSelectionIndex === index
        }"
        @mousedown.prevent
        @click="selectItem(item)"
        @mouseenter="currentSelectionIndex = index"
      >
        <span class="simple-typeahead-list-item-text">
          <slot :item="item"></slot>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Chip from './chip.vue'

type Props = {
  id?: string
  placeholder: string
  items: { id: string }[]
  minInputLength: number
  itemChipLabel: (item: unknown) => string
  itemKey: (item: unknown) => string
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'onInput', searchTerm: string): void
  (e: 'selectItems', items: unknown[]): void
}>()

const selectedItems = ref<unknown[]>([])

const inputId =
  props.id || `simple_typeahead_${(Math.random() * 1000).toFixed()}`
const input = ref<string>('')
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
      `#${wrapperId.value} .simple-typeahead-list`
    )
    const activeNode = document.querySelector<HTMLElement>(
      `#${wrapperId.value} .simple-typeahead-list-item.simple-typeahead-list-item-active`
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
const selectCurrentSelection = () => {
  if (currentSelection.value) {
    selectItem(currentSelection.value)
  }
}
const selectItem = (item: unknown) => {
  input.value = ''
  currentSelectionIndex.value = 0
  document.getElementById(inputId)?.blur()
  selectedItems.value.push(item)

  emit('selectItems', selectedItems.value)
}

const unselectItem = (item: unknown) => {
  const itemKey = props.itemKey(item)
  selectedItems.value = selectedItems.value.filter(
    i => props.itemKey(i) !== itemKey
  )
  emit('selectItems', selectedItems.value)
}

const wrapperId = computed(() => `${inputId}_wrapper`)
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
.simple-typeahead {
  position: relative;
  width: 100%;
}
.simple-typeahead-wrapper {
  border: 0 none;
  background-color: var(--color-alt);
  height: auto;
  color: inherit;
  box-shadow: 0 2px 0 0 var(--dsfr-g600);
  padding: 10px;
}
.simple-typeahead-input {
  margin-bottom: 0;

  appearance: none;
  border: 0;
  box-shadow: 0 0 0 0 !important;
}

.simple-typeahead-input:focus {
  border-right: 0 !important;
}

.simple-typeahead .simple-typeahead-list {
  position: absolute;
  width: 100%;
  border: none;
  max-height: 400px;
  overflow-y: auto;
  border-bottom: 0.1rem solid #d1d1d1;
  z-index: 9;
}
.simple-typeahead .simple-typeahead-list .simple-typeahead-list-item {
  cursor: pointer;
  background-color: #fafafa;
  padding: 0.6rem 1rem;
  border-bottom: 0.1rem solid #d1d1d1;
  border-left: 0.1rem solid #d1d1d1;
  border-right: 0.1rem solid #d1d1d1;
}

.simple-typeahead
  .simple-typeahead-list
  .simple-typeahead-list-item:last-child {
  border-bottom: none;
}

.simple-typeahead
  .simple-typeahead-list
  .simple-typeahead-list-item.simple-typeahead-list-item-active {
  background-color: #e1e1e1;
}
</style>
