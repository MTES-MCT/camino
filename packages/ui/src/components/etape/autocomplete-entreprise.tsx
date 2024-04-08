import { caminoDefineComponent, useState } from '@/utils/vue-tsx-utils'
import { DeepReadonly, computed, watch } from 'vue'
import { EtapeEntreprise } from 'camino-common/src/etape'
import { EntrepriseId, Entreprise } from 'camino-common/src/entreprise'
import { isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { TypeAheadSmartMultiple } from '../_ui/typeahead-smart-multiple'

interface Props {
  nonSelectableEntities?: EntrepriseId[]
  selectedEntities?: DeepReadonly<EtapeEntreprise[]>
  allEntities: Entreprise[]
  name: 'titulaires' | 'amodiataires'
  onEntreprisesUpdate: (entreprise: DeepReadonly<EtapeEntreprise[]>) => void
}
export const AutocompleteEntreprise = caminoDefineComponent<Props>(['onEntreprisesUpdate', 'nonSelectableEntities', 'selectedEntities', 'allEntities', 'name'], props => {
  const [mySelectedEntities, setMySelectedEntities] = useState<DeepReadonly<EtapeEntreprise[]>>(props.selectedEntities ?? [])

  watch(
    () => props.selectedEntities,
    entities => {
      setMySelectedEntities(entities?.map(entity => ({ ...entity })) ?? [])
    }
  )
  watch(
    () => mySelectedEntities.value,
    () => {
      props.onEntreprisesUpdate(mySelectedEntities.value)
    },
    { immediate: true }
  )

  const selectableEntities = computed(() => props.allEntities.filter(entity => isNullOrUndefinedOrEmpty(props.nonSelectableEntities) || !props.nonSelectableEntities.some(id => id === entity.id)))

  const onSelectEntreprises = (entreprises: { id: EntrepriseId }[]) => {
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
