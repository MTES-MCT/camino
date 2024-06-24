import { FunctionalComponent } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { Alert } from '@/components/_ui/alert'
import { EtapeApiClient } from '../etape/etape-api-client'
import { EtapeId } from 'camino-common/src/etape'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
interface Props {
  id: EtapeId
  close: () => void
  apiClient: Pick<EtapeApiClient, 'deposeEtape'>
  etapeTypeId: EtapeTypeId
}

export const DeposeEtapePopup: FunctionalComponent<Props> = props => {
  const deposeEtape = async () => {
    await props.apiClient.deposeEtape(props.id)
  }

  const content = () => (
    <Alert
      type="warning"
      title="Attention : cette opération est définitive et ne peut pas être annulée."
      description={props.etapeTypeId === 'mfr' ? 'Souhaitez-vous effectuer le dépôt ?' : "Souhaitez-vous finaliser l'étape ?"}
    />
  )

  return (
    <FunctionalPopup title="Confirmation" content={content} close={props.close} validate={{ action: deposeEtape, text: props.etapeTypeId === 'mfr' ? 'Déposer' : 'Finaliser' }} canValidate={true} />
  )
}
