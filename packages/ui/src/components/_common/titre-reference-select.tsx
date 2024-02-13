import { ref } from 'vue'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { DsfrSelect } from '../_ui/dsfr-select'
import { NonEmptyArray, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { ReferenceTypeId, sortedReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { TitreReference } from 'camino-common/src/titres-references'
import { DsfrInput } from '../_ui/dsfr-input'
import { DsfrButton, DsfrButtonIcon } from '../_ui/dsfr-button'

type EditableTitreReference = TitreReference | { referenceTypeId: null; nom: null }
export interface Props {
  initialValues?: TitreReference[]
  onUpdateReferences: (references: TitreReference[]) => void
}
const isTitreReference = (value: EditableTitreReference): value is TitreReference => {
  return value.nom !== null && value.referenceTypeId !== null
}

export const TitreReferenceSelect = caminoDefineComponent<Props>(['initialValues', 'onUpdateReferences'], props => {
  const references = ref<EditableTitreReference[]>([...props.initialValues ?? []])
  const referenceAdd = () => {
    references.value.push({ referenceTypeId: null, nom: null })
  }

  const referenceRemove = (index: number) => () => {
    references.value.splice(index, 1)
    props.onUpdateReferences(references.value.filter(isTitreReference))
  }

  const referencesTypes = sortedReferencesTypes.map(({id, nom})=> ({id, label: nom})) as NonEmptyArray<{id: ReferenceTypeId, label: string}>

  const onReferenceChanged = (index: number) => (referenceTypeId: ReferenceTypeId | null) => {
    references.value[index].referenceTypeId = referenceTypeId
    props.onUpdateReferences(references.value.filter(isTitreReference))
  }
  const onReferenceValueChanged = (index: number) => (nom: string | null) => {
    references.value[index].nom = nom
    props.onUpdateReferences(references.value.filter(isTitreReference))
  }
  return () => (
    <div class="fr-input-group">
        <label class="fr-label fr-mb-1w" for="references">
          Références
        </label>
        {references.value.map((reference, index) => (
          <div key={index} class="fr-grid-row fr-grid-row--middle fr-mb-3v">
            <DsfrSelect class='fr-col fr-mb-0' legend={{main: '', visible: false}} initialValue={reference.referenceTypeId} items={referencesTypes} valueChanged={onReferenceChanged(index)} />
            <DsfrInput class='fr-col fr-ml-2v fr-mb-0' type={{type: 'text'}} legend={{main: '', visible: false}} initialValue={reference.nom} valueChanged={onReferenceValueChanged(index)} />
            <DsfrButtonIcon class='fr-ml-2v' icon='fr-icon-delete-bin-line' onClick={referenceRemove(index)} title={`Supprimer la référence ${index + 1}`} buttonType='tertiary' />
          </div>
        ))}
        
        {isNullOrUndefined(references.value.find(r => !r.referenceTypeId || !r.nom)) ? (
          <DsfrButton buttonType='tertiary' onClick={referenceAdd} title='Ajouter une référence' icon={'fr-icon-add-line'} />
        ) : null}
      </div>
  )
})
