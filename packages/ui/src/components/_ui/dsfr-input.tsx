import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'

type TextInputType = {
  type: 'text'
}

type NumberInputType = {
  type: 'number'
  min?: number
  max?: number
}
type BaseProps = {
  id?: string
  legend: { main: string; description?: string; placeholder?: string; info?: string }
  disabled?: boolean
  required?: boolean
}

type Props = BaseProps & (TextProps | NumberProps)

type TextProps = {
  type: TextInputType
  valueChanged: (value: string) => void
  initialValue?: string | null
}

type NumberProps = {
  type: NumberInputType
  valueChanged: (value: number | null) => void
  initialValue?: number | null
}

const isTextProps = (props: Props): props is BaseProps & TextProps => props.type.type === 'text'
const isNumberProps = (props: Props): props is BaseProps & NumberProps => props.type.type === 'number'

export const DsfrInput = caminoDefineComponent<Props>(['id', 'initialValue', 'valueChanged', 'legend', 'disabled', 'required', 'type'], props => {
  const id = props.id ?? `input_${(Math.random() * 1000).toFixed()}`

  const updateFromEvent = (e: Event) => {
    if (isEventWithTarget(e)) {
      if (isTextProps(props)) {
        props.valueChanged(e.target.value)
      } else if (isNumberProps(props)) {
        const valueAsNumber = e.target.valueAsNumber
        props.valueChanged(isNaN(valueAsNumber) ? null : valueAsNumber)
      }
    }
  }
  return () => (
    <div class={['fr-input-group', props.disabled ? 'fr-input-group--disabled' : null]}>
      <label class="fr-label" for={id}>
        {props.legend.main} {props.required ? ' *' : null}
        {props.legend.description ? <span class="fr-hint-text" v-html={props.legend.description}></span> : null}
      </label>
      <input
        onInput={updateFromEvent}
        placeholder={props.legend.placeholder}
        value={props.initialValue}
        class="fr-input"
        name={id}
        id={id}
        disabled={props.disabled ?? false}
        required={props.required ?? false}
        {...(props.type ?? { type: 'text' })}
        aria-describedby={props.legend.info ? `${id}-info` : undefined}
      />
      {props.legend.info ? (
        <p id={`${id}-info`} class="fr-info-text">
          {props.legend.info}
        </p>
      ) : null}
    </div>
  )
})
