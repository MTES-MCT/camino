import { EditableTitre } from 'camino-common/src/titres'
import { TitreReference } from 'camino-common/src/titres-references'
import { defineComponent, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { DsfrInput } from '../_ui/dsfr-input'
import { TitreApiClient } from './titre-api-client'
import { TitreReferenceSelect } from '../_common/titre-reference-select'

interface Props {
  titre: EditableTitre
  close: () => void
  apiClient: Pick<TitreApiClient, 'editTitre'>
  reload: () => Promise<void>
}

export const EditPopup = defineComponent<Props>(props => {
  const nom = ref(props.titre.nom)
  const references = ref<TitreReference[]>([...props.titre.references])

  const nomChange = (value: string) => {
    nom.value = value
  }

  const onUpdateReferences = (newReferences: TitreReference[]) => {
    references.value = newReferences
  }
  const content = () => (
    <form>
      <DsfrInput id="titre_nom" legend={{ main: 'Nom' }} type={{ type: 'text' }} valueChanged={nomChange} initialValue={nom.value} required={true} />
      <TitreReferenceSelect class="fr-mt-3w" initialValues={props.titre.references} onUpdateReferences={onUpdateReferences} />
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
            references: references.value,
          })
          props.reload()
        },
        text: 'Enregistrer',
      }}
      canValidate={nom.value !== ''}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EditPopup.props = ['titre', 'close', 'apiClient', 'reload']
