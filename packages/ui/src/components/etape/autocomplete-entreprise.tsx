import { caminoDefineComponent, useState } from '@/utils/vue-tsx-utils'
import { DeepReadonly, computed, ref, watch } from 'vue'
import { EtapeEntreprise } from 'camino-common/src/etape'
import { EntrepriseId, Entreprise } from 'camino-common/src/entreprise'
import { ButtonIcon } from '../_ui/button-icon'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'

interface Props {
  nonSelectableEntities?: EntrepriseId[]
  selectedEntities?: DeepReadonly<EtapeEntreprise[]>
  allEntities: Entreprise[]
  placeholder: string
  onEntreprisesUpdate: (entreprise: DeepReadonly<EtapeEntreprise[]>) => void
}
export const AutocompleteEntreprise = caminoDefineComponent<Props>(['onEntreprisesUpdate', 'nonSelectableEntities', 'selectedEntities', 'allEntities', 'placeholder'], props => {
  const overrideItem = ref<{ id: EntrepriseId } | null>(null)

  const [mySelectedEntities, setMySelectedEntities] = useState<DeepReadonly<EtapeEntreprise[]>>(props.selectedEntities ?? [])
  const inputValue = ref<string>('')

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

  const selectableEntities = computed(() =>
    props.allEntities
      .filter(entity => isNullOrUndefinedOrEmpty(props.nonSelectableEntities) || !props.nonSelectableEntities.some(id => id === entity.id))
      .filter(entity => !mySelectedEntities.value.some(mySelectedEntitiy => mySelectedEntitiy.id === entity.id))
      .filter(entity => inputValue.value === '' || entity.nom.toLowerCase().includes(inputValue.value.toLowerCase()))
  )

  const addEntity = (entity: Entreprise | undefined) => {
    if (entity) {
      setMySelectedEntities([...mySelectedEntities.value, { id: entity.id, operateur: false }])
      overrideItem.value = null

    }
  }

  const removeEntity = (entity: DeepReadonly<EtapeEntreprise>) => {
    setMySelectedEntities(mySelectedEntities.value.filter(e => e.id !== entity.id))
  }

  const toggleOperator = (index: number) => () => {
    setMySelectedEntities(mySelectedEntities.value.map((value, myIndex) => {
      if (index === myIndex) {
        return {...value, operateur: !value.operateur}
      } else {
        return value
      }
    }))
  }

  const getEntrepriseNom = (entity: DeepReadonly<EtapeEntreprise>) => props.allEntities.find(({ id }) => id === entity.id)?.nom ?? ''

  const itemKey: keyof Entreprise = 'id'
  const typeAheadProps = computed(() => ({
    id: 'autocomplete_entreprise',
    itemKey,
    placeholder: props.placeholder,
    items: selectableEntities.value,
    minInputLength: 2,
    itemChipLabel: (item: Entreprise) => item.nom,
    onSelectItem: addEntity,
    onInput: (event: string) => (inputValue.value = event),
  }))

  return () => (
    <div>
      {mySelectedEntities.value.map((entity, index) => (
        <div key={entity.id}>
          <div class="flex mb-s flex-center">
            <div class="h4" style="flex: 0 1 15em">
              {getEntrepriseNom(entity)}
            </div>

            <label style="flex: auto; user-select: none">
              <input checked={entity.operateur} type="checkbox" class="mr-xs" onChange={toggleOperator(index)} />
              Opérateur
            </label>

            <ButtonIcon class="btn py-s px-m rnd-xs" style="" onClick={() => removeEntity(entity)} icon="minus" title="Supprime l’entreprise" />
          </div>
        </div>
      ))}

      <TypeAheadSingle props={typeAheadProps.value} overrideItem={overrideItem.value} />
    </div>
  )
})
