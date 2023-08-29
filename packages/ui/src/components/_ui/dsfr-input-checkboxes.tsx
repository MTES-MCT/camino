import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { DsfrInputCheckbox, Props as InputCheckboxProps } from './dsfr-input-checkbox'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { ref, watch } from 'vue'

type Props = {
  id?: string
  legend: { main: string; description?: string }
  disabled?: boolean
  valueChanged: (values: string[]) => void
  elements: (Omit<InputCheckboxProps, 'disabled' | 'id' | 'valueChanged'> & { itemId: string })[]
}

export const DsfrInputCheckboxes = caminoDefineComponent<Props>(['id', 'valueChanged', 'legend', 'disabled', 'elements'], props => {
  const id = props.id ?? `checkboxes_${(Math.random() * 1000).toFixed()}`

  const values = ref<string[]>([])

  watch(
    () => props.elements,
    () => {
      values.value = props.elements
        .filter(element => {
          return element.initialValue ?? false
        })
        .map(({ itemId }) => {
          return itemId
        })
      props.valueChanged(values.value)
    },
    { deep: true }
  )

  const updateCheckbox = (itemId: string) => (checked: boolean) => {
    if (checked) {
      values.value.push(itemId)
    } else {
      values.value = values.value.filter(id => id !== itemId)
    }

    props.valueChanged(values.value)
  }

  return () => (
    <fieldset class="fr-fieldset" id={id} aria-labelledby={`${id}-legend`} disabled={props.disabled ?? false}>
      <legend class="fr-fieldset__legend--regular fr-fieldset__legend" id={`${id}-legend`}>
        {props.legend.main}
        {props.legend.description ? <span class="fr-hint-text">{props.legend.description}</span> : null}
      </legend>
      {props.elements.map((element, index) => (
        <div key={index} class="fr-fieldset__element">
          <DsfrInputCheckbox {...element} id={`${id}_${index}`} valueChanged={updateCheckbox(element.itemId)} />
        </div>
      ))}
    </fieldset>
  )
})
