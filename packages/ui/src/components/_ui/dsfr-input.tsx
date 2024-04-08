import { caminoDefineComponent, isEventWithTarget, random } from '@/utils/vue-tsx-utils'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { ref } from 'vue'

type TextInputType = {
  type: 'text'
}

type DateInputType = {
  type: 'date'
}

type NumberInputType = {
  type: 'number'
  min?: number
  max?: number
}
type BaseProps = {
  id?: string
  legend: { main: string; visible?: boolean; description?: string; placeholder?: string; info?: string }
  disabled?: boolean
  required?: boolean
}

type Props = BaseProps & (TextProps | NumberProps | DateProps)

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

type DateProps = {
  type: DateInputType
  valueChanged: (value: CaminoDate | null) => void
  initialValue?: CaminoDate | null
}

const isTextProps = (props: Props): props is BaseProps & TextProps => props.type.type === 'text'
const isNumberProps = (props: Props): props is BaseProps & NumberProps => props.type.type === 'number'
const isDateProps = (props: Props): props is BaseProps & DateProps => props.type.type === 'date'

export const DsfrInput = caminoDefineComponent<Props>(['id', 'initialValue', 'valueChanged', 'legend', 'disabled', 'required', 'type'], props => {
  const id = props.id ?? `input_${(random() * 1000).toFixed()}`

  const value = ref(props.initialValue)
  const updateFromEvent = (e: Event) => {
    if (isEventWithTarget(e)) {
      if (isTextProps(props)) {
        value.value = e.target.value
        props.valueChanged(e.target.value)
      } else if (isNumberProps(props)) {
        const valueAsNumber = e.target.valueAsNumber
        value.value = valueAsNumber
        props.valueChanged(isNaN(valueAsNumber) ? null : valueAsNumber)
      } else if (isDateProps(props)) {
        const dateParsed = caminoDateValidator.safeParse(e.target.value)
        props.valueChanged(dateParsed.success ? dateParsed.data : null)
      }
    }
  }

  return () => (
    <div class={['fr-input-group', isNotNullNorUndefined(props.disabled) && props.disabled ? 'fr-input-group--disabled' : null]}>
      {props.legend.visible ?? true ? (
        <label class="fr-label" for={id}>
          {props.legend.main} {isNotNullNorUndefined(props.required) && props.required ? ' *' : null}
          {isNotNullNorUndefined(props.legend.description) ? <span class="fr-hint-text" v-html={props.legend.description}></span> : null}
        </label>
      ) : null}
      <input
        onInput={updateFromEvent}
        placeholder={props.legend.placeholder}
        value={value.value}
        class="fr-input"
        name={id}
        id={id}
        disabled={props.disabled ?? false}
        required={props.required ?? false}
        {...(props.type ?? { type: 'text' })}
        aria-describedby={isNotNullNorUndefined(props.legend.info) && props.legend.info !== '' ? `${id}-info` : undefined}
      />
      {isNotNullNorUndefined(props.legend.info) && props.legend.info !== '' ? (
        <p id={`${id}-info`} class="fr-info-text">
          {props.legend.info}
        </p>
      ) : null}
    </div>
  )
})
