import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { sortedReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { EditableTitre } from 'camino-common/src/titres'
import { TitreReference } from 'camino-common/src/titres-references'
import { ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { Icon } from '../_ui/icon'

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
    <>
      <div>
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Nom</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <input
              value={nom.value}
              onInput={e => {
                if (isEventWithTarget(e)) {
                  console.log('zizi')
                  nom.value = e.target.value
                }
              }}
              type="text"
              placeholder="Nom"
              class="p-s"
            />
          </div>
        </div>
        <hr />
      </div>

      <div>
        <h3 class="mb-s">Références</h3>
        <p class="h6 italic">Optionnel</p>
        <hr />
        {references.value.map((reference, index) => (
          <div key={index} class="flex full-x mb-s">
            <select v-model={reference.referenceTypeId} class="p-s mr-s">
              {sortedReferencesTypes.map(referenceType => (
                <option key={referenceType.id} value={referenceType.id}>
                  {referenceType.nom}
                </option>
              ))}
            </select>
            <input v-model={reference.nom} type="text" class="p-s mr-s" placeholder="valeur" />
            <div class="flex-right">
              <button class="btn py-s px-m rnd-xs" onClick={() => referenceRemove(index)}>
                <Icon name="minus" size="M" />
              </button>
            </div>
          </div>
        ))}

        {references.value && !references.value.find(r => !r.referenceTypeId || !r.nom) ? (
          <button class="btn rnd-xs py-s px-m full-x mb flex h6" onClick={referenceAdd}>
            <span class="mt-xxs">Ajouter une référence</span>
            <Icon name="plus" size="M" class="flex-right" />
          </button>
        ) : null}
      </div>
    </>
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
