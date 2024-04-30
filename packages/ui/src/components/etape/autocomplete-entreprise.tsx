import { useState } from '@/utils/vue-tsx-utils'
import { DeepReadonly, computed, defineComponent, watch } from 'vue'
import { EtapeEntreprise } from 'camino-common/src/etape'
import { EntrepriseId, Entreprise } from 'camino-common/src/entreprise'
import { isNullOrUndefinedOrEmpty, stringArrayEquals } from 'camino-common/src/typescript-tools'
import { TypeAheadSmartMultiple } from '../_ui/typeahead-smart-multiple'

interface Props {
  nonSelectableEntities?: DeepReadonly<EntrepriseId[]>
  selectedEntities?: DeepReadonly<EtapeEntreprise[]>
  allEntities: DeepReadonly<Entreprise[]>
  name: 'titulaires' | 'amodiataires'
  onEntreprisesUpdate: (entreprise: DeepReadonly<EtapeEntreprise[]>) => void
}
export const AutocompleteEntreprise = defineComponent<Props>(props => {
  const [mySelectedEntities, setMySelectedEntities] = useState<DeepReadonly<EtapeEntreprise[]>>(props.selectedEntities ?? [])

  watch(
    () => props.selectedEntities,
    (newEntities, oldEntities) => {
      if (!stringArrayEquals(newEntities?.map(({ id }) => id) ?? [], oldEntities?.map(({ id }) => id) ?? [])) {
        setMySelectedEntities(newEntities?.map(entity => ({ ...entity })) ?? [])
      }
    }
  )
  watch(
    () => mySelectedEntities.value,
    () => {
      props.onEntreprisesUpdate(mySelectedEntities.value)
    }
  )

  const selectableEntities = computed(() => {
    return props.allEntities.filter(entity => isNullOrUndefinedOrEmpty(props.nonSelectableEntities) || !props.nonSelectableEntities.some(id => id === entity.id))
  })

  const onSelectEntreprises = (entreprises: { id: EntrepriseId }[]) => {
    // TODO 2024-04-22 virer opérateur
    setMySelectedEntities(entreprises.map(entity => ({ ...entity, operateur: false })) ?? [])
  }

  return () => (
    <TypeAheadSmartMultiple
      filter={{
        name: props.name,
        value: mySelectedEntities.value.map(({ id }) => id),
        elements: selectableEntities.value,
        lazy: false,
      }}
      onSelectItems={onSelectEntreprises}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
AutocompleteEntreprise.props = ['onEntreprisesUpdate', 'nonSelectableEntities', 'selectedEntities', 'allEntities', 'name']
