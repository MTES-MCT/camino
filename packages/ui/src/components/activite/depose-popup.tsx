import { FunctionalPopup } from '../_ui/functional-popup'
import { ActiviteApiClient } from './activite-api-client'
import { Activite } from 'camino-common/src/activite'
import { Alert } from '../_ui/alert'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { defineComponent } from 'vue'

interface Props {
  close: () => void
  apiClient: Pick<ActiviteApiClient, 'deposerActivite'>
  activite: Pick<Activite, 'id' | 'titre' | 'type_id'>
}
export const ActiviteDeposePopup = defineComponent<Props>(props => {
  const content = () => (
    <Alert
      type="warning"
      title="Attention : cette opération est définitive et ne peut pas être annulée."
      description={
        <>
          {' '}
          Souhaitez-vous déposer ce <span class="fr-text--bold"> {ActivitesTypes[props.activite.type_id].nom}</span> du titre
          <span class="fr-text--bold"> {props.activite.titre.nom}</span> ?{' '}
        </>
      }
    />
  )

  return () => (
    <FunctionalPopup
      title="Dépôt"
      content={content}
      close={props.close}
      validate={{
        action: async () => {
          await props.apiClient.deposerActivite(props.activite.id)
        },
        text: 'Déposer',
      }}
      canValidate={true}
    />
  )
})
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
ActiviteDeposePopup.props = ['close', 'apiClient', 'activite']
