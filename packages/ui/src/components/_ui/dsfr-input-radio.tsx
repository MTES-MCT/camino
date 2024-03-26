import { isEventWithTarget, random } from '@/utils/vue-tsx-utils'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { defineComponent } from 'vue'

type Props<T extends string> = {
  id?: string
  legend: { main: string; description?: string }
  disabled?: boolean
  required?: boolean
  orientation?: 'vertical' | 'horizontal'
  valueChanged: (value: T) => void
  initialValue?: T | null
  elements: { itemId: T; legend: { main: string; description?: string } }[]
}

export const DsfrInputRadio = defineComponent(<T extends string>(props: Props<T>) => {
  const id = props.id ?? `radio_${(random() * 1000).toFixed()}`

  const onChangeRadio = (itemId: T) => (e: Event) => {
    if (isEventWithTarget(e) && Boolean(e.target.value)) {
      props.valueChanged(itemId)
    }
  }

  return () => (
    <fieldset class="fr-fieldset" id={id} aria-labelledby={`${id}-legend`} disabled={props.disabled ?? false}>
      <legend class="fr-fieldset__legend--regular fr-fieldset__legend" id={`${id}-legend`}>
        {props.legend.main} {isNotNullNorUndefined(props.required) && props.required ? ' *' : ''}
        {isNotNullNorUndefined(props.legend.description) && props.legend.description !== '' ? <span class="fr-hint-text">{props.legend.description}</span> : null}
      </legend>
      {props.elements.map((element, index) => (
        <div key={element.itemId} class={['fr-fieldset__element', isNotNullNorUndefined(props.orientation) && props.orientation === 'horizontal' ? 'fr-fieldset__element--inline' : null]}>
          <div class="fr-radio-group">
            <input type="radio" id={`${id}-${index}`} checked={props.initialValue === element.itemId} name={id} onChange={onChangeRadio(element.itemId)} />
            <label class="fr-label" for={`${id}-${index}`}>
              {element.legend.main}
              {isNotNullNorUndefined(element.legend.description) && element.legend.description !== '' ? <span class="fr-hint-text">{element.legend.description}</span> : null}
            </label>
          </div>
        </div>
      ))}
    </fieldset>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DsfrInputRadio.props = ['id', 'valueChanged', 'legend', 'disabled', 'elements', 'required', 'initialValue', 'orientation']
