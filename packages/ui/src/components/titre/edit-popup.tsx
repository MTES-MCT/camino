import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { sortedReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { EditableTitre } from 'camino-common/src/titres'
import { TitreReference } from 'camino-common/src/titres-references'
import { ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'

interface Props {
  titre: EditableTitre
  close: () => void
  editTitre: (titre: EditableTitre) => Promise<void>
}

type EditableTitreReference = TitreReference | { referenceTypeId: ''; nom: '' }
const isTitreReference = (value: EditableTitreReference): value is TitreReference => {
  return value.nom !== '' && value.referenceTypeId !== ''
}
export const EditPopup = caminoDefineComponent<Props>(['titre', 'close', 'editTitre'], props => {
  const nom = ref(props.titre.nom)
  const references = ref<EditableTitreReference[]>([...props.titre.references])
  const referenceAdd = () => {
    references.value.push({ referenceTypeId: '', nom: '' })
  }

  const referenceRemove = (index: number) => {
    references.value.splice(index, 1)
  }

  const content = () => (
    <form>
      <div class="fr-input-group">
        <label class="fr-label" for="titreNom">
          Nom *
        </label>
        <input
          value={nom.value}
          onInput={e => {
            if (isEventWithTarget(e)) {
              nom.value = e.target.value
            }
          }}
          class="fr-input"
          name="titreNom"
          id="titreNom"
          type="text"
          required
        />
      </div>
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
        {references.value && !references.value.find(r => !r.referenceTypeId || !r.nom) ? (
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
        action: async () =>
          props.editTitre({
            id: props.titre.id,
            nom: nom.value,
            references: references.value.filter(isTitreReference),
          }),
        can: nom.value !== '',
        text: 'Enregistrer',
      }}
    />
  )
})
