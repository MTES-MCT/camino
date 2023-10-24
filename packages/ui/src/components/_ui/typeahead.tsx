import { computed, Ref, ref, watch } from 'vue'
import { Chip } from './chip'
import styles from './typeahead.module.css'
import './typeahead.css'
import { isEventWithTarget, caminoDefineComponent, random } from '@/utils/vue-tsx-utils'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

type TypeAheadRecord = Record<string | symbol | number, any>

export type TypeAheadType = 'single' | 'multiple'
export type Props<T extends TypeAheadRecord, K extends keyof T> = {
  overrideItems?: (Pick<T, K> & Partial<Omit<T, K>>)[]
  props: {
    id?: string
    itemKey: K
    placeholder: string
    type: TypeAheadType
    items: T[]
    minInputLength: number
    alwaysOpen?: boolean
    itemChipLabel: (key: T) => string
    displayItemInList?: (item: T) => JSX.Element
    onSelectItem?: (item: T | undefined) => void
    onSelectItems?: (item: T[]) => void
    onInput?: (item: string) => void
  }
}

const GenericTypeAhead = <T extends TypeAheadRecord, K extends keyof T>() =>
  caminoDefineComponent<Props<T, K>>(['props', 'overrideItems'], props => {
    const id = props.props.id ?? `typeahead_${(random() * 1000).toFixed()}`
    const wrapperId = computed(() => `${id}_wrapper`)
    const getItems = (items: (Pick<T, K> & Partial<Omit<T, K>>)[]): T[] => items.map(o => props.props.items.find(i => i[props.props.itemKey] === o[props.props.itemKey])).filter(isNotNullNorUndefined)
    const selectedItems = ref<T[]>(getItems(props.overrideItems ?? [])) as Ref<T[]>

    const input = ref<string>(props.props.type === 'single' && props.overrideItems?.length ? props.props.itemChipLabel(getItems(props.overrideItems)[0]) : '')

    watch(
      () => props.overrideItems,
      newItems => {
        selectedItems.value = getItems(newItems ?? [])
        input.value = props.props.type === 'single' && newItems?.length ? props.props.itemChipLabel(getItems(newItems)[0]) : ''
      },
      { deep: true }
    )

    const unselectItem = (item: T) => {
      const itemKey = item[props.props.itemKey]
      selectedItems.value = selectedItems.value.filter(i => i[props.props.itemKey] !== itemKey)
      props.props.onSelectItems?.(selectedItems.value)
      props.props.onSelectItem?.(undefined)
    }
    const isInputFocused = ref<boolean>(false)
    const currentSelectionIndex = ref<number>(0)

    const isListVisible = computed(() => {
      return props.props.alwaysOpen === true ? true : isInputFocused.value && input.value.length >= props.props.minInputLength && props.props.items.length
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
    const deleteLastSelected = () => {
      if (input.value === '') {
        selectedItems.value.pop()
        props.props.onSelectItems?.(selectedItems.value)
        props.props.onSelectItem?.(undefined)
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
      if (props.props.type === 'multiple') {
        input.value = ''
      } else {
        input.value = props.props.itemChipLabel(item)
      }
      currentSelectionIndex.value = 0
      document.getElementById(id)?.blur()

      if (props.props.type === 'multiple') {
        selectedItems.value.push(item)
      } else {
        selectedItems.value = [item]
      }

      props.props.onSelectItem?.(item)
      props.props.onSelectItems?.(selectedItems.value)
    }
    const myTypeaheadInput = ref<HTMLOrSVGElement | null>(null)

    const selectCurrentSelection = (event: KeyboardEvent) => {
      if (currentSelection.value) {
        selectItem(currentSelection.value)
        event.stopPropagation()
      }

      if (props.props.type === 'multiple') {
        myTypeaheadInput?.value?.focus?.()
      }
    }

    return () => (
      <div id={wrapperId.value} class={styles.typeahead}>
        <div class={['flex', 'typeahead-wrapper']}>
          {props.props.type === 'multiple' ? (
            <>
              {selectedItems.value.map(item => {
                return <Chip key={item[props.props.itemKey]} nom={props.props.itemChipLabel(item)} class="mr-xs mb-xs mt-xs" onDeleteClicked={() => unselectItem(item)} />
              })}
            </>
          ) : null}
          <input
            id={id}
            ref={myTypeaheadInput}
            value={input.value}
            type="text"
            name={id}
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

const HiddenTypeAhead = GenericTypeAhead()
export const TypeAhead = <T extends TypeAheadRecord, K extends keyof T>(props: Props<T, K>): JSX.Element => {
  return <HiddenTypeAhead props={props.props} overrideItems={props.overrideItems} />
}
