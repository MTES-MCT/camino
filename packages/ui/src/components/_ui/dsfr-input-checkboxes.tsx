import { random } from '@/utils/vue-tsx-utils'
import { DsfrInputCheckbox, Props as InputCheckboxProps } from './dsfr-input-checkbox'
import { Ref, defineComponent, ref, watch } from 'vue'
import { DeepReadonly, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

type Props<T extends string> = {
  id?: string
  legend: { main: string; description?: string }
  disabled?: boolean
  valueChanged: (values: DeepReadonly<T[]>) => void
  size?: 'sm' | 'md'
  elements: (Omit<InputCheckboxProps, 'disabled' | 'id' | 'valueChanged' | 'initialValue'> & { itemId: DeepReadonly<T> })[]
  initialCheckedValue: DeepReadonly<NoInfer<T>[]>
}

export const DsfrInputCheckboxes = defineComponent(<T extends string>(props: Props<T>) => {
  const id = props.id ?? `checkboxes_${(random() * 1000).toFixed()}`

  const values = ref<DeepReadonly<T[]>>(props.elements.filter(element => props.initialCheckedValue.includes(element.itemId)).map(({ itemId }) => itemId)) as Ref<DeepReadonly<T[]>>
  console.log('plop', JSON.stringify(values.value))
  watch(
    () => props.elements,
    () => {
      values.value = props.elements
        .filter(element => {
          return props.initialCheckedValue.includes(element.itemId)
        })
        .map(({ itemId }) => {
          return itemId
        })
      props.valueChanged(values.value)
    },
    { deep: true }
  )

  const updateCheckbox = (itemId: DeepReadonly<T>) => (checked: boolean) => {
    if (checked) {
      values.value = [...values.value, itemId]
    } else {
      values.value = values.value.filter(id => id !== itemId)
    }

    props.valueChanged(values.value)
  }

  return () => (
    <fieldset class="fr-fieldset" id={id} aria-labelledby={`${id}-legend`} disabled={props.disabled ?? false} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      {isNotNullNorUndefinedNorEmpty(props.legend.main) ? (
        <legend class="fr-fieldset__legend--regular fr-fieldset__legend" id={`${id}-legend`}>
          {props.legend.main}
          {isNotNullNorUndefinedNorEmpty(props.legend.description) ? <span class="fr-hint-text">{props.legend.description}</span> : null}
        </legend>
      ) : null}

      {props.elements.map((element, index) => (
        <div key={index} class={['fr-fieldset__element', props.size === 'sm' ? 'fr-mb-1v' : null]}>
          <DsfrInputCheckbox {...element} initialValue={props.initialCheckedValue.includes(element.itemId)} size={props.size} id={`${id}_${index}`} valueChanged={updateCheckbox(element.itemId)} />
        </div>
      ))}
    </fieldset>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DsfrInputCheckboxes.props = ['id', 'valueChanged', 'legend', 'disabled', 'elements', 'size', 'initialCheckedValue']
