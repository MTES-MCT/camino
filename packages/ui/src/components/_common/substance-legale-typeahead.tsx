import { Ref, computed, defineComponent, ref } from 'vue'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { SubstanceLegaleId, SubstancesLegale } from 'camino-common/src/static/substancesLegales'

type Props = {
  alwaysOpen?: boolean
  substanceLegaleIds: SubstanceLegaleId[]
  initialValue?: SubstanceLegaleId
  substanceLegaleSelected: (substanceLegaleId:  SubstanceLegaleId | null) => void
}

export const SubstanceLegaleTypeahead = defineComponent((props: Props) => {
  const substanceSelected = ref<{ id: SubstanceLegaleId; nom: string } | null>(props.initialValue ? SubstancesLegale[props.initialValue] : null) as Ref<{ id: SubstanceLegaleId; nom: string } | null>
  const substanceUpdate = async (substance: { id: SubstanceLegaleId; nom: string } | undefined) => {
    substanceSelected.value = substance ?? null
    props.substanceLegaleSelected(isNotNullNorUndefined(substance) ? substance.id : null)
  }

  const sortedByUs = computed<{ id: SubstanceLegaleId; nom: string }[]>(() => [...props.substanceLegaleIds].map(sId => SubstancesLegale[sId]).sort((a, b) => a.nom.localeCompare(b.nom)))

  const substancesFiltered = ref<{ id: SubstanceLegaleId; nom: string }[]>(sortedByUs.value) as Ref<{ id: SubstanceLegaleId; nom: string }[]>
  const substanceOnInput = (search: string) => {
    const formatedSearch = search.trim().toLowerCase()

    if (formatedSearch.length === 0) {
      substancesFiltered.value = sortedByUs.value
    } else {
      substancesFiltered.value = sortedByUs.value.filter(substance => substance.nom.toLowerCase().includes(formatedSearch.toLowerCase()))
    }
  }

return () => (
    <TypeAheadSingle
      overrideItem={substanceSelected.value}
      props={{
        alwaysOpen: props.alwaysOpen,
        items: substancesFiltered.value,
        itemChipLabel: item => item.nom,
        itemKey: 'id',
        placeholder: '',
        minInputLength: 0,
        onSelectItem: substanceUpdate,
        onInput: substanceOnInput,
      }}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
SubstanceLegaleTypeahead.props = ['substanceLegaleIds', 'substanceLegaleSelected', 'alwaysOpen', 'initialValue']
