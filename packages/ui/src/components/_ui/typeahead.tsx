import { computed, defineComponent, Ref, ref } from 'vue'
import { Chip } from './chip'
import styles from './typeahead.module.css'

type TypeAheadRecord = Record<string | symbol | number, any>

export type Props<T extends TypeAheadRecord, K extends keyof T> = {
  id?: string
  itemKey: K
  placeholder: string
  type: 'single' | 'multiple'
  items: T[]
  overrideItems?: (Pick<T, K> & Partial<Omit<T, K>>)[]
  minInputLength: number
  itemChipLabel: (key: T) => string
  displayItemInList?: (item: T) => JSX.Element
  onSelectItem?: (item: T | undefined) => void
  onSelectItems?: (item: T[]) => void
  onInput?: (item: string) => void
}

// FIXME 2023-01-03 : add to typescript vue type utils
const isEventWithTarget = (
  event: any
): event is FocusEvent & { target: HTMLInputElement } => event.target

const GenericTypeAhead = <T extends TypeAheadRecord, K extends keyof T>() =>
  defineComponent<Props<T, K>>({
    props: [
      'id',
      'placeholder',
      'itemKey',
      'type',
      'items',
      'overrideItems',
      'minInputLength',
      'itemChipLabel',
      'displayItemInList',
      'onSelectItem',
      'onSelectItems',
      'onInput'
    ] as unknown as undefined,
    setup(props) {
      const id = props.id ?? `typeahead_${(Math.random() * 1000).toFixed()}`
      const wrapperId = computed(() => `${id}_wrapper`)
      const getItems = (items: (Pick<T, K> & Partial<Omit<T, K>>)[]): T[] =>
        items
          .map(o =>
            props.items.find(i => i[props.itemKey] === o[props.itemKey])
          )
          .filter((o): o is T => !!o)
      const selectedItems = ref<T[]>(
        getItems(props.overrideItems ?? [])
      ) as Ref<T[]>

      const unselectItem = (item: T) => {
        const itemKey = item[props.itemKey]
        selectedItems.value = selectedItems.value.filter(
          i => i[props.itemKey] !== itemKey
        )
        props.onSelectItems?.(selectedItems.value)
        props.onSelectItem?.(undefined)
      }
      const input = ref<string>(
        props.type === 'single' && props.overrideItems?.length
          ? props.itemChipLabel(getItems(props.overrideItems)[0])
          : ''
      )
      const isInputFocused = ref<boolean>(false)
      const currentSelectionIndex = ref<number>(0)

      const isListVisible = computed(() => {
        return (
          isInputFocused.value &&
          input.value.length >= props.minInputLength &&
          props.items.length
        )
      })
      const onInput = (payload: Event) => {
        if (
          isListVisible.value &&
          currentSelectionIndex.value >= props.items.length
        ) {
          currentSelectionIndex.value = (props.items.length || 1) - 1
        }
        if (isEventWithTarget(payload)) {
          props.onInput?.(payload.target.value)
          input.value = payload.target.value
        }
      }

      const scrollSelectionIntoView = () => {
        setTimeout(() => {
          const listNode = document.querySelector<HTMLElement>(
            `#${wrapperId.value} .${styles['typeahead-list']}`
          )
          const activeNode = document.querySelector<HTMLElement>(
            `#${wrapperId.value} .${styles['typeahead-list-item']}.${styles['typeahead-list-item-active']}`
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
      const deleteLastSelected = () => {
        if (input.value === '') {
          selectedItems.value.pop()
          props.onSelectItems?.(selectedItems.value)
        }
      }
      const notSelectedItems = computed(() => {
        const selectItemKeys = selectedItems.value.map(i => i[props.itemKey])
        return props.items.filter(
          item => !selectItemKeys.includes(item[props.itemKey])
        )
      })
      const currentSelection = computed(() => {
        return isListVisible.value &&
          currentSelectionIndex.value < notSelectedItems.value.length
          ? notSelectedItems.value[currentSelectionIndex.value]
          : undefined
      })
      const selectItem = (item: T) => {
        if (props.type === 'multiple') {
          input.value = ''
        } else {
          input.value = props.itemChipLabel(item)
        }
        currentSelectionIndex.value = 0
        document.getElementById(id)?.blur()

        if (props.type === 'multiple') {
          selectedItems.value.push(item)
        } else {
          selectedItems.value = [item]
        }

        props.onSelectItem?.(item)
        props.onSelectItems?.(selectedItems.value)
      }
      const myTypeaheadInput = ref<HTMLOrSVGElement | null>(null)

      const selectCurrentSelection = (event: KeyboardEvent) => {
        if (currentSelection.value) {
          selectItem(currentSelection.value)
          event.stopPropagation()
        }

        if (props.type === 'multiple') {
          myTypeaheadInput?.value?.focus?.()
        }
      }
      return () => (
        <div id={wrapperId.value} class={styles.typeahead}>
          <div class={`flex ${styles['typeahead-wrapper']} p-xs`}>
            {props.type === 'multiple' ? (
              <>
                {selectedItems.value.map(item => {
                  return (
                    <Chip
                      key={item[props.itemKey]}
                      nom={props.itemChipLabel(item)}
                      class="mr-xs mb-xs mt-xs"
                      onDeleteClicked={() => unselectItem(item)}
                    />
                  )
                })}
              </>
            ) : null}
            <input
              id={id}
              ref={myTypeaheadInput}
              value={input.value}
              type="text"
              class={styles['typeahead-input']}
              placeholder={props.placeholder}
              autocomplete="off"
              onInput={onInput}
              onFocus={() => (isInputFocused.value = true)}
              onBlur={() => (isInputFocused.value = false)}
              onKeydown={payload => {
                // FIXME il doit bien y avoir une enum quelque part dans la lib du dom avec la liste des keys non ?
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
              }}
              onKeyup={payload => {
                if (payload.key === 'Enter') {
                  selectCurrentSelection(payload)
                  payload.preventDefault()
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
                    class={`${styles['typeahead-list-item']} ${
                      currentSelectionIndex.value === index
                        ? styles['typeahead-list-item-active']
                        : ''
                    }`}
                    onMousedown={payload => payload.preventDefault()}
                    onClick={() => selectItem(item)}
                    onMouseenter={() => (currentSelectionIndex.value = index)}
                  >
                    <span>
                      {props.displayItemInList
                        ? props.displayItemInList(item)
                        : props.itemChipLabel(item)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      )
    }
  })

const HiddenTypeAhead = GenericTypeAhead()
export const TypeAhead = <T extends TypeAheadRecord, K extends keyof T>(
  props: Props<T, K>
): JSX.Element => {
  return (
    <HiddenTypeAhead
      id={props.id}
      itemKey={props.itemKey}
      items={props.items}
      placeholder={props.placeholder}
      minInputLength={props.minInputLength}
      type={props.type}
      overrideItems={props.overrideItems}
      itemChipLabel={props.itemChipLabel}
      displayItemInList={props.displayItemInList}
      onSelectItem={props.onSelectItem}
      onSelectItems={props.onSelectItems}
      onInput={props.onInput}
    />
  )
}
