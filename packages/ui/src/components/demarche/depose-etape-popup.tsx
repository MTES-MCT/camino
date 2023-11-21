import { FunctionalComponent } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { Alert } from '@/components/_ui/alert'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { EtapeApiClient } from '../etape/etape-api-client'
import { EtapeId } from 'camino-common/src/etape'
interface Props {
  id: EtapeId
  etapeTypeId: EtapeTypeId
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeId
  titreNom: string
  close: () => void
  apiClient: Pick<EtapeApiClient, 'deposeEtape'>
}

export const DeposeEtapePopup: FunctionalComponent<Props> = props => {
  const deposeEtape = async () => {
    await props.apiClient.deposeEtape(props.id)
  }
  const content = () => <Alert type="warning" title="Attention : cette opération est définitive et ne peut pas être annulée." description={() => <>Souhaitez vous effectuer le dépôt ?</>} />

  return <FunctionalPopup title={`Dépôt`} content={content} close={props.close} validate={{ action: deposeEtape, text: 'Déposer' }} canValidate={true} />
}
