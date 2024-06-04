import { useState } from '@/utils/vue-tsx-utils'
import { DeepReadonly, computed, defineComponent, ref, watch } from 'vue'
import { EntrepriseId, Entreprise } from 'camino-common/src/entreprise'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { TypeAheadSingle } from '../_ui/typeahead-single'

interface Props {
  initialValue?: DeepReadonly<EntrepriseId | null>
  items: DeepReadonly<Entreprise[]>
  onUpdate: (entreprise: DeepReadonly<EntrepriseId | null>) => void
  id?: string
}

export const AutocompleteEntrepriseSingle = defineComponent<Props>(props => {
  const [currentEntrepriseId, setCurrentEntrepriseId] = useState<DeepReadonly<EntrepriseId | null>>(props.initialValue ?? null)
  const currentSearch = ref<string>('')

  watch(
    () => props.initialValue,
    (newValue, oldValue) => {
      if (newValue !== oldValue) {
        setCurrentEntrepriseId(newValue ?? null)
      }
    }
  )

  watch(
    () => currentEntrepriseId.value,
    () => {
      props.onUpdate(currentEntrepriseId.value)
    }
  )

  const onEntrepriseSelect = (entreprise?: Entreprise) => {
    setCurrentEntrepriseId(entreprise?.id ?? null)
  }

  const filteredItems = computed<Readonly<Entreprise[]>>(() => {
    if (currentSearch.value.length === 0) {
      return props.items
    }

    return props.items.filter(({ nom }) => nom.toLowerCase().includes(currentSearch.value.toLowerCase()))
  })

  function onSearch(search: string) {
    currentSearch.value = search.trim().toLowerCase()
  }

  const defaultItem = computed<{ id: EntrepriseId } | null>(() => {
    if (isNotNullNorUndefined(currentEntrepriseId.value)) {
      return { id: currentEntrepriseId.value }
    }

    return null
  })

  return () => (
    <TypeAheadSingle
      overrideItem={defaultItem.value}
      props={{
        items: filteredItems.value,
        itemChipLabel: item => item.nom,
        itemKey: 'id',
        placeholder: '',
        minInputLength: 0,
        onSelectItem: onEntrepriseSelect,
        onInput: onSearch,
        id: props.id,
      }}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
AutocompleteEntrepriseSingle.props = ['initialValue', 'items', 'onUpdate', 'id']
