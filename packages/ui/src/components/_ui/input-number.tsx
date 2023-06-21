import { textNumberFormat, textToNumberFormat } from '@/utils'
import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { numberFormat } from 'camino-common/src/number'
import { computed } from 'vue'

interface Props {
  initialValue?: number | undefined
  negative?: boolean
  integer?: boolean
  numberChanged: (value: number | null) => void
  placeholder?: string
}

export const InputNumber = caminoDefineComponent<Props>(['initialValue', 'negative', 'integer', 'numberChanged', 'placeholder'], (props: Props) => {
  const value = computed<number | undefined>(() => {
    return props.initialValue ?? undefined
  })
  const negative = computed<boolean>(() => {
    return props.negative ?? false
  })

  const integer = computed<boolean>(() => {
    return props.integer ?? false
  })

  const valueFormatted = computed<string>(() => {
    if (!value.value) return ''

    if (integer.value) return numberFormat(Math.floor(value.value))

    return numberFormat(value.value)
  })

  const textToNumberFormatFunc = (event: FocusEvent) => {
    if (isEventWithTarget(event) && event.target !== null) {
      event.target.value = textNumberFormat(event.target.value, {
        negative: negative.value,
        integer: integer.value,
      })
      const number = textToNumberFormat(event.target.value)
      props.numberChanged(number)
    }
  }

  return () => <input value={valueFormatted.value} placeholder={props.placeholder} type="text" pattern="([0-9]{1,3}[\s]?)*([.,][0-9]*)?" class="p-s text-right" onBlur={textToNumberFormatFunc} />
})
