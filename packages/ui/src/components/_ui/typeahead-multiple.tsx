import { computed, Ref, ref, watch, defineComponent } from 'vue'
import styles from './typeahead.module.css'
import { isEventWithTarget, useState } from '@/utils/vue-tsx-utils'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { DsfrTag } from './tag'
import type { JSX } from 'vue/jsx-runtime'
import { fr } from '@codegouvfr/react-dsfr'
type TypeAheadRecord = Record<string | symbol | number, any>

type Props<T extends TypeAheadRecord, K extends keyof T> = {
  overrideItems?: (Pick<T, K> & Partial<Omit<T, K>>)[]
  props: {
    id: string
    itemKey: K
    placeholder: string
    items: T[]
    minInputLength: number
    alwaysOpen?: boolean
    itemChipLabel: (key: T) => string
    displayItemInList?: (item: T) => JSX.Element
    onSelectItems: (item: T[]) => void
    onInput?: (item: string) => void
  }
}

export const TypeAheadMultiple = defineComponent(<T extends TypeAheadRecord, K extends keyof T>(props: Props<T, K>) => {
  const wrapperId = computed(() => `${props.props.id}_wrapper`)
  const getItems = (items: (Pick<T, K> & Partial<Omit<T, K>>)[]): T[] => items.map(o => props.props.items.find(i => i[props.props.itemKey] === o[props.props.itemKey])).filter(isNotNullNorUndefined)
  const selectedItems = ref<T[]>(getItems(props.overrideItems ?? [])) as Ref<T[]>

  const input = ref<string>('')

  watch(
    () => props.overrideItems,
    newItems => {
      selectedItems.value = getItems(newItems ?? [])
      input.value = ''
    },
    { deep: true }
  )

  const unselectItem = (item: T) => () => {
    const itemKey = item[props.props.itemKey]
    selectedItems.value = selectedItems.value.filter(i => i[props.props.itemKey] !== itemKey)
    props.props.onSelectItems(selectedItems.value)
  }
  const [isInputFocused, setInputFocused] = useState<boolean>(false)
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
  const onBlur = () => {
    setInputFocused(false)
    input.value = ''
  }
  const onFocus = () => {
    setInputFocused(true)
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
    if (isListVisible.value && currentSelectionIndex.value < notSelectedItems.value.length - 1) {
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
  const deleteLastSelected = () => {
    if (input.value === '') {
      selectedItems.value.pop()
      props.props.onSelectItems(selectedItems.value)
    }
  }
  const notSelectedItems = computed(() => {
    const selectItemKeys = selectedItems.value.map(i => i[props.props.itemKey])

    return props.props.items.filter(item => !selectItemKeys.includes(item[props.props.itemKey]))
  })
  const currentSelection = computed(() => {
    return isListVisible.value && currentSelectionIndex.value < notSelectedItems.value.length ? notSelectedItems.value[currentSelectionIndex.value] : undefined
  })
  const selectItem = (item: T) => {
    input.value = ''

    currentSelectionIndex.value = 0
    document.getElementById(props.props.id)?.focus()

    selectedItems.value.push(item)

    props.props.onSelectItems?.(selectedItems.value)
  }
  const myTypeaheadInput = ref<HTMLOrSVGElement | null>(null)

  const selectCurrentSelection = (event: KeyboardEvent) => {
    if (currentSelection.value) {
      selectItem(currentSelection.value)
      event.stopPropagation()
    }

    myTypeaheadInput?.value?.focus?.()
  }

  const focusInput = (event: MouseEvent) => {
    myTypeaheadInput?.value?.focus?.()
    event.stopPropagation()
  }

  return () => (
    <div id={wrapperId.value} class={[styles.typeahead]}>
      <div
        style={{ display: 'flex', maxHeight: 'unset', flexWrap: 'wrap', gap: '8px', outlineOffset: '2px', outlineWidth: '2px', outlineColor: '#0a76f6' }}
        class={[fr.cx('fr-input'), styles['fake-input']]}
        onClick={focusInput}
      >
        {selectedItems.value.map(item => {
          return (
            <DsfrTag key={item[props.props.itemKey]} label={props.props.itemChipLabel(item)} ariaLabel={`Supprimer ${props.props.itemChipLabel(item)}`} tagSize="sm" onClicked={unselectItem(item)} />
          )
        })}

        <input
          id={props.props.id}
          ref={myTypeaheadInput}
          value={input.value}
          type="text"
          name={props.props.id}
          style={{ outline: 'none' }}
          placeholder={props.props.placeholder}
          autocomplete="off"
          onInput={onInput}
          onFocus={onFocus}
          onBlur={onBlur}
          role="combobox"
          aria-controls={`${props.props.id}-control`}
          aria-activedescendant={isListVisible.value ? `${props.props.id}-control-${currentSelectionIndex.value}` : `${props.props.id}-control`}
          aria-expanded={isListVisible.value}
          aria-autocomplete="list"
          onKeydown={payload => {
            // TODO 2023-06-19 il doit bien y avoir une enum quelque part dans la lib du dom avec la liste des keys non ?
            // Oui --> https://github.com/Moh-Snoussi/keyboard-event-key-type
            // Underlying issue: https://github.com/microsoft/TypeScript/issues/38886
            if (payload.key === 'Backspace') {
              deleteLastSelected()
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
      <ul class={`${styles['typeahead-list']} ${isListVisible.value ? styles['typeahead-list--visible'] : ''}`} tabindex="-1" id={`${props.props.id}-control`} role="listbox">
        {notSelectedItems.value.map((item, index) => {
          return (
            <li
              key={index}
              class={`${styles['typeahead-list-item']} ${currentSelectionIndex.value === index ? styles['typeahead-list-item-active'] : ''}`}
              onMousedown={payload => payload.preventDefault()}
              onClick={() => selectItem(item)}
              onMouseenter={() => (currentSelectionIndex.value = index)}
              aria-selected={isListVisible.value && currentSelectionIndex.value === index}
              id={`${props.props.id}-control-${index}`}
            >
              {props.props.displayItemInList ? props.props.displayItemInList(item) : <span>{props.props.itemChipLabel(item)}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TypeAheadMultiple.props = ['overrideItems', 'props']
