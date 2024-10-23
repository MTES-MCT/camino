import { FunctionalComponent } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { Alert } from '@/components/_ui/alert'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
interface Props {
  close: () => void
  deposeEtape: () => Promise<void>
  etapeTypeId: EtapeTypeId
}

export const DeposeEtapePopup: FunctionalComponent<Props> = props => {
  const content = () => <Alert type="warning" title="Attention : cette opération est définitive et ne peut pas être annulée." description="Souhaitez-vous finaliser l'étape ?" />

  return <FunctionalPopup title="Confirmation" content={content} close={props.close} validate={{ action: props.deposeEtape, text: 'Finaliser' }} canValidate={true} />
}
