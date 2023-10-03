import { caminoDefineComponent, isEventWithTarget, random } from '@/utils/vue-tsx-utils'
import { DsfrInputCheckbox, Props as InputCheckboxProps } from './dsfr-input-checkbox'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { ref, watch } from 'vue'

type Props = {
  id?: string
  legend: { main: string; description?: string }
  disabled?: boolean
  required?: boolean
  valueChanged: (value: string) => void
  initialValue?: string | null
  elements: { itemId: string; legend: { main: string; description?: string } }[]
}

export const DsfrInputRadio = caminoDefineComponent<Props>(['id', 'valueChanged', 'legend', 'disabled', 'elements', 'required', 'initialValue'], props => {
  const id = props.id ?? `radio_${(random() * 1000).toFixed()}`

  const onChangeRadio = (itemId: string) => (e: Event) => {
    if (isEventWithTarget(e) && Boolean(e.target.value)) {
      props.valueChanged(itemId)
    }
  }

  return () => (
    <fieldset class="fr-fieldset" id={id} aria-labelledby={`${id}-legend`} disabled={props.disabled ?? false}>
      <legend class="fr-fieldset__legend--regular fr-fieldset__legend" id={`${id}-legend`}>
        {props.legend.main} {props.required ? ' *' : ''}
        {props.legend.description ? <span class="fr-hint-text">{props.legend.description}</span> : null}
      </legend>
      {props.elements.map((element, index) => (
        <div key={element.itemId} class="fr-fieldset__element">
          <div class="fr-radio-group">
            <input type="radio" id={`${id}-${index}`} checked={props.initialValue === element.itemId} name={id} onChange={onChangeRadio(element.itemId)} />
            <label class="fr-label" for={`${id}-${index}`}>
              {element.legend.main}
              {element.legend.description ? <span class="fr-hint-text">{element.legend.description}</span> : null}
            </label>
          </div>
        </div>
      ))}
    </fieldset>
  )
})
