<template>
  <input
    :value="valueFormatted"
    type="text"
    pattern="([0-9]{1,3}[\s]?)*([.,][0-9]*)?"
    class="p-s text-right"
    @blur="textToNumberFormatFunc($event)"
  />
</template>

<script setup lang="ts">
import { textNumberFormat, textToNumberFormat } from '../../utils'
import { numberFormat } from '../../utils/number-format'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: number | undefined
    negative?: boolean
    integer?: boolean
  }>(),
  {
    integer: false,
    negative: false,
    modelValue: undefined
  }
)

const emits = defineEmits<{
  (e: 'update:modelValue', number: number | null): void
}>()

const valueFormatted = computed<string>(() => {
  if (!props.modelValue) return ''

  if (props.integer) return numberFormat(Math.floor(props.modelValue))

  return numberFormat(props.modelValue)
})

const textToNumberFormatFunc = (
  event: FocusEvent & { target: HTMLInputElement }
) => {
  if (event.target !== null) {
    event.target.value = textNumberFormat(event.target.value, {
      negative: props.negative,
      integer: props.integer
    })

    const number = textToNumberFormat(event.target.value)

    emits('update:modelValue', number)
  }
}
</script>
