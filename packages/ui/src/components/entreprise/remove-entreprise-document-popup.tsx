import { FunctionalComponent } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { Alert } from '@/components/_ui/alert'
import { DocumentId, EntrepriseId } from 'camino-common/src/entreprise'
import { EntrepriseApiClient } from './entreprise-api-client'
interface Props {
  entrepriseId: EntrepriseId
  entrepriseDocument: { nom: string; id: DocumentId }
  close: () => void
  apiClient: Pick<EntrepriseApiClient, 'deleteEntrepriseDocument'>
}

export const RemoveEntrepriseDocumentPopup: FunctionalComponent<Props> = props => {
  const content = () => (
    <Alert
      type="warning"
      title="Attention : cette opération est définitive et ne peut pas être annulée."
      description={() => (
        <>
          Souhaitez vous supprimer le document <span class="fr-text--bold">{props.entrepriseDocument.nom}</span> ?
        </>
      )}
    />
  )
  return (
    <FunctionalPopup
      title={`Suppression du document`}
      content={content}
      close={props.close}
      validate={{
        action: async () => {
          props.apiClient.deleteEntrepriseDocument(props.entrepriseId, props.entrepriseDocument.id)
        },
        text: 'Supprimer',
      }}
    />
  )
}
