import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { sortedReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { EditableTitre } from 'camino-common/src/titres'
import { TitreReference } from 'camino-common/src/titres-references'
import { ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { DsfrInput } from '../_ui/dsfr-input'
import { TitreApiClient } from './titre-api-client'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'

interface Props {
  titre: EditableTitre
  close: () => void
  apiClient: Pick<TitreApiClient, 'editTitre'>
  reload: () => Promise<void>
}

type EditableTitreReference = TitreReference | { referenceTypeId: ''; nom: '' }
const isTitreReference = (value: EditableTitreReference): value is TitreReference => {
  return value.nom !== '' && value.referenceTypeId !== ''
}
export const EditPopup = caminoDefineComponent<Props>(['titre', 'close', 'apiClient', 'reload'], props => {
  const nom = ref(props.titre.nom)
  const references = ref<EditableTitreReference[]>([...props.titre.references])
  const referenceAdd = () => {
    references.value.push({ referenceTypeId: '', nom: '' })
  }

  const referenceRemove = (index: number) => {
    references.value.splice(index, 1)
  }

  const nomChange = (value: string) => {
    nom.value = value
  }
  const content = () => (
    <form>
      <DsfrInput id="titre_nom" legend={{ main: 'Nom' }} type={{ type: 'text' }} valueChanged={nomChange} initialValue={nom.value} required={true} />
      <div class="fr-input-group">
        <label class="fr-label" for="references">
          Références
        </label>
        {references.value.map((reference, index) => (
          <div key={index} class="fr-grid-row fr-grid-row--middle fr-mb-3v">
            <select v-model={reference.referenceTypeId} class="fr-select fr-col">
              {sortedReferencesTypes.map(referenceType => (
                <option key={referenceType.id} value={referenceType.id}>
                  {referenceType.nom}
                </option>
              ))}
            </select>
            <input v-model={reference.nom} type="text" class="fr-input fr-col fr-ml-2v" />
            <button class="fr-btn fr-icon-delete-line fr-btn--icon fr-btn--tertiary fr-ml-2v" type="button" onClick={() => referenceRemove(index)} />
          </div>
        ))}
        {isNullOrUndefined(references.value.find(r => !r.referenceTypeId || !r.nom)) ? (
          <button class="fr-btn fr-icon-add-line fr-btn--icon-right fr-btn--tertiary" id="references" onClick={referenceAdd}>
            Ajouter une référence
          </button>
        ) : null}
      </div>
    </form>
  )

  return () => (
    <FunctionalPopup
      title="Modification du titre"
      content={content}
      close={props.close}
      validate={{
        action: async () => {
          await props.apiClient.editTitre({
            id: props.titre.id,
            nom: nom.value,
            references: references.value.filter(isTitreReference),
          })
          props.reload()
        },
        text: 'Enregistrer',
      }}
      canValidate={nom.value !== ''}
    />
  )
})
