import { Ref, computed, defineComponent, ref } from 'vue'
import { TypeAheadSingle } from './typeahead-single'
import { DeepReadonly, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

type Props<T extends string> = {
  alwaysOpen?: boolean
  possibleValues: DeepReadonly<TypeaheadValue<T>>[]
  initialValue?: DeepReadonly<NoInfer<T>>
  valueIdSelected: (valueId: DeepReadonly<NoInfer<T>> | null) => void
}

type TypeaheadValue<T> = { id: T; nom: string }

export const TypeaheadSmartSingle = defineComponent(<T extends string,> (props: Props<T>) => {
  const valueTypeSelected = ref<DeepReadonly<TypeaheadValue<T>> | null>(props.possibleValues.find(({id}) => props.initialValue === id) ?? null) as Ref<DeepReadonly<TypeaheadValue<T>> | null>
  const onValueUpdate = async (value: DeepReadonly<TypeaheadValue<T>>| undefined) => {
    valueTypeSelected.value = value ?? null
    props.valueIdSelected(isNotNullNorUndefined(value) ? value.id : null)
  }

  const sortedByUs = computed<DeepReadonly<TypeaheadValue<T>>[]>(() => [...props.possibleValues].sort((a, b) => a.nom.localeCompare(b.nom)))

  const valuesFiltered = ref<DeepReadonly<TypeaheadValue<T>>[]>(sortedByUs.value) as Ref<DeepReadonly<TypeaheadValue<T>>[]>
  const onInput = (search: string) => {
    const formatedSearch = search.trim().toLowerCase()

    if (formatedSearch.length === 0) {
      valuesFiltered.value = sortedByUs.value
    } else {
      valuesFiltered.value = sortedByUs.value.filter(value => value.nom.toLowerCase().includes(formatedSearch.toLowerCase()))
    }
  }

  return () => (
    <TypeAheadSingle
      overrideItem={valueTypeSelected.value}
      props={{
        alwaysOpen: props.alwaysOpen,
        items: valuesFiltered.value,
        itemChipLabel: item => item.nom,
        itemKey: 'id',
        placeholder: '',
        minInputLength: 0,
        onSelectItem: onValueUpdate,
        onInput,
      }}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TypeaheadSmartSingle.props = ['valueIdSelected', 'possibleValues', 'alwaysOpen', 'initialValue']
