import { computed, Ref, ref, watch, defineComponent } from 'vue'
import styles from './typeahead.module.css'
import { isEventWithTarget, random } from '@/utils/vue-tsx-utils'
import { DeepReadonly, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

type TypeAheadRecord = Record<string | symbol | number, any>

type Props<T extends TypeAheadRecord, K extends keyof DeepReadonly<T>> = {
  overrideItem: (Pick<T, K> & Partial<Omit<T, K>>) | null
  disabled?: boolean
  props: {
    id?: string
    itemKey: K
    placeholder: string
    items: DeepReadonly<T[]>
    minInputLength: number
    alwaysOpen?: boolean
    itemChipLabel: (key: DeepReadonly<T>) => string
    displayItemInList?: (item: DeepReadonly<T>) => JSX.Element
    onSelectItem: (item: DeepReadonly<T> | undefined) => void
    onInput?: (item: string) => void
  }
}

export const TypeAheadSingle = defineComponent(<T extends TypeAheadRecord, K extends keyof DeepReadonly<T>>(props: Props<T, K>) => {
  const id = props.props.id ?? `typeahead_${(random() * 1000).toFixed()}`
  const wrapperId = computed(() => `${id}_wrapper`)
  const getItem = (item: (Pick<T, K> & Partial<Omit<T, K>>) | null): DeepReadonly<T> | null =>
    props.props.items.find(i => {
      return i[props.props.itemKey] === item?.[props.props.itemKey]
    }) ?? null
  const selectedItem = ref<DeepReadonly<T> | null>(getItem(props.overrideItem)) as Ref<DeepReadonly<T> | null>

  const initItem = getItem(props.overrideItem)
  const input = ref<string>(initItem !== null ? props.props.itemChipLabel(initItem) : '')

  watch(
    () => props.overrideItem,
    newItem => {
      selectedItem.value = getItem(newItem)
      const newItemTranslate = getItem(props.overrideItem)

      input.value = isNotNullNorUndefined(newItemTranslate) ? props.props.itemChipLabel(newItemTranslate) : ''
    },
    { deep: true }
  )
  const isInputFocused = ref<boolean>(false)
  const currentSelectionIndex = ref<number>(0)

  const isListVisible = computed<boolean>(() => {
    return props.props.alwaysOpen === true ? true : isInputFocused.value && input.value.length >= props.props.minInputLength && isNotNullNorUndefinedNorEmpty(props.props.items)
  })
  const onInput = (payload: Event) => {
    if (isListVisible.value && currentSelectionIndex.value >= props.props.items.length) {
      currentSelectionIndex.value = (props.props.items.length || 1) - 1
    }
    if (isEventWithTarget(payload)) {
      props.props.onInput?.(payload.target.value)
      input.value = payload.target.value
    }
  }

  const scrollSelectionIntoView = () => {
    setTimeout(() => {
      const listNode = document.querySelector<HTMLElement>(`#${wrapperId.value} .${styles['typeahead-list']}`)
      const activeNode = document.querySelector<HTMLElement>(`#${wrapperId.value} .${styles['typeahead-list-item']}.${styles['typeahead-list-item-active']}`)

      if (listNode && activeNode) {
        if (!(activeNode.offsetTop >= listNode.scrollTop && activeNode.offsetTop + activeNode.offsetHeight < listNode.scrollTop + listNode.offsetHeight)) {
          let scrollTo = 0
          if (activeNode.offsetTop > listNode.scrollTop) {
            scrollTo = activeNode.offsetTop + activeNode.offsetHeight - listNode.offsetHeight
          } else if (activeNode.offsetTop < listNode.scrollTop) {
            scrollTo = activeNode.offsetTop
          }

          listNode.scrollTo(0, scrollTo)
        }
      }
    })
  }

  const onArrowDown = () => {
    if (isListVisible.value && currentSelectionIndex.value < props.props.items.length - 1) {
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
  const deleteSelection = () => {
    selectedItem.value = null
    props.props.onSelectItem(undefined)
  }
  const notSelectedItems = computed(() => {
    const selectItemKey = selectedItem.value?.[props.props.itemKey]

    return props.props.items.filter(item => selectItemKey !== item[props.props.itemKey])
  })
  const currentSelection = computed(() => {
    return isListVisible.value && currentSelectionIndex.value < notSelectedItems.value.length ? notSelectedItems.value[currentSelectionIndex.value] : undefined
  })
  const selectItem = (item: DeepReadonly<T>) => {
    input.value = props.props.itemChipLabel(item)

    currentSelectionIndex.value = 0
    document.getElementById(id)?.blur()

    selectedItem.value = item

    props.props.onSelectItem(item)
  }
  const myTypeaheadInput = ref<HTMLOrSVGElement | null>(null)

  const selectCurrentSelection = (event: KeyboardEvent) => {
    if (currentSelection.value) {
      selectItem(currentSelection.value)
      event.stopPropagation()
    }
  }

  return () => (
    <div id={wrapperId.value} class={[styles.typeahead, 'dsfr']}>
      <div class={['flex']}>
        <input
          id={id}
          ref={myTypeaheadInput}
          value={input.value}
          type="text"
          name={id}
          disabled={props.disabled}
          class={[styles['typeahead-input'], 'fr-input']}
          placeholder={props.props.placeholder}
          autocomplete="off"
          onInput={onInput}
          onFocus={() => (isInputFocused.value = true)}
          onBlur={() => (isInputFocused.value = false)}
          onKeydown={payload => {
            // TODO 2023-06-19 il doit bien y avoir une enum quelque part dans la lib du dom avec la liste des keys non ?
            // Oui --> https://github.com/Moh-Snoussi/keyboard-event-key-type
            // Underlying issue: https://github.com/microsoft/TypeScript/issues/38886
            if (payload.key === 'Backspace') {
              deleteSelection()
            }
            if (payload.key === 'ArrowDown') {
              onArrowDown()
              payload.preventDefault()
            }
            if (payload.key === 'ArrowUp') {
              onArrowUp()
              payload.preventDefault()
            }
            if (payload.key === 'Enter') {
              payload.preventDefault()
              payload.stopPropagation()
            }
          }}
          onKeyup={payload => {
            if (payload.key === 'Enter') {
              selectCurrentSelection(payload)
              payload.preventDefault()
              payload.stopPropagation()
            }
          }}
        />
      </div>
      {isListVisible.value ? (
        <div class={styles['typeahead-list']}>
          {notSelectedItems.value.map((item, index) => {
            return (
              <div
                key={index}
                class={`${styles['typeahead-list-item']} ${currentSelectionIndex.value === index ? styles['typeahead-list-item-active'] : ''}`}
                onMousedown={payload => payload.preventDefault()}
                onClick={() => selectItem(item)}
                onMouseenter={() => (currentSelectionIndex.value = index)}
              >
                {props.props.displayItemInList ? props.props.displayItemInList(item) : <span>{props.props.itemChipLabel(item)}</span>}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TypeAheadSingle.props = ['overrideItem', 'props', 'disabled']
