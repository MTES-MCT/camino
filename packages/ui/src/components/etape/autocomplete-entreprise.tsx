import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { computed, ref, watch } from 'vue'
import { EtapeEntreprise } from 'camino-common/src/etape'
import { EntrepriseId, Entreprise } from 'camino-common/src/entreprise'
import { ButtonIcon } from '../_ui/button-icon'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'

interface Props {
  nonSelectableEntities?: EntrepriseId[]
  selectedEntities?: EtapeEntreprise[]
  allEntities: Entreprise[]
  placeholder: string
  onEntreprisesUpdate: (entreprise: EtapeEntreprise[]) => void
}
export const AutocompleteEntreprise = caminoDefineComponent<Props>(['onEntreprisesUpdate', 'nonSelectableEntities', 'selectedEntities', 'allEntities', 'placeholder'], props => {
  const overrideItems = ref<{ id: EntrepriseId }[]>([])

  const mySelectedEntities = ref<EtapeEntreprise[]>([])
  const inputValue = ref<string>('')

  watch(
    () => props.selectedEntities,
    entities => {
      mySelectedEntities.value = entities?.map(entity => ({ ...entity })) ?? []
    },
    { immediate: true, deep: true }
  )

  const selectableEntities = computed(() =>
    props.allEntities
      .filter(entity => isNullOrUndefinedOrEmpty(props.nonSelectableEntities) || !props.nonSelectableEntities.some(id => id === entity.id))
      .filter(entity => !mySelectedEntities.value.some(mySelectedEntitiy => mySelectedEntitiy.id === entity.id))
      .filter(entity => inputValue.value === '' || entity.nom.toLowerCase().includes(inputValue.value.toLowerCase()))
  )

  const addEntity = (entity: Entreprise | undefined) => {
    if (entity) {
      mySelectedEntities.value.push({ id: entity.id, operateur: false })
      overrideItems.value = []

      props.onEntreprisesUpdate(mySelectedEntities.value)
    }
  }

  const removeEntity = (entity: EtapeEntreprise) => {
    mySelectedEntities.value = mySelectedEntities.value.filter(e => e.id !== entity.id)
    props.onEntreprisesUpdate(mySelectedEntities.value)
  }

  const toggleOperator = (entity: EtapeEntreprise) => {
    entity.operateur = !entity.operateur
    props.onEntreprisesUpdate(mySelectedEntities.value)
  }

  const getEntrepriseNom = (entity: EtapeEntreprise) => props.allEntities.find(({ id }) => id === entity.id)?.nom ?? ''

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
      {mySelectedEntities.value.map(entity => (
        <div key={entity.id}>
          <div class="flex mb-s flex-center">
            <div class="h4" style="flex: 0 1 15em">
              {getEntrepriseNom(entity)}
            </div>

            <label style="flex: auto; user-select: none">
              <input checked={entity.operateur} type="checkbox" class="mr-xs" onChange={() => toggleOperator(entity)} />
              Opérateur
            </label>

            <ButtonIcon class="btn py-s px-m rnd-xs" style="" onClick={() => removeEntity(entity)} icon="minus" title="Supprime l’entreprise" />
          </div>
        </div>
      ))}

      <TypeAheadSingle props={typeAheadProps.value} overrideItems={overrideItems.value} />
    </div>
  )
})
