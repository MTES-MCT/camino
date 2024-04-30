import { FunctionalPopup } from '../_ui/functional-popup'
import { ActiviteApiClient } from './activite-api-client'
import { Activite } from 'camino-common/src/activite'
import { Alert } from '../_ui/alert'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { defineComponent } from 'vue'

interface Props {
  close: () => void
  apiClient: Pick<ActiviteApiClient, 'supprimerActivite'>
  activite: Pick<Activite, 'id' | 'titre' | 'type_id'>
}
export const ActiviteRemovePopup = defineComponent<Props>(props => {
  const content = () => (
    <Alert
      type="warning"
      title="Attention : cette opération est définitive et ne peut pas être annulée."
      description={
        <>
          {' '}
          Souhaitez-vous supprimer ce <span class="fr-text--bold"> {ActivitesTypes[props.activite.type_id].nom}</span> du titre
          <span class="fr-text--bold"> {props.activite.titre.nom}</span> ?{' '}
        </>
      }
    />
  )

  return () => (
    <FunctionalPopup
      title="Suppression"
      content={content}
      close={props.close}
      validate={{ action: () => props.apiClient.supprimerActivite(props.activite.id), text: 'Supprimer' }}
      canValidate={true}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
ActiviteRemovePopup.props = ['close', 'apiClient', 'activite']
