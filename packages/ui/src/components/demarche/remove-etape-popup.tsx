import { FunctionalComponent } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { Alert } from '@/components/_ui/alert'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { DemarcheTypeId, DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { EtapeApiClient } from '../etape/etape-api-client'
import { EtapeId } from 'camino-common/src/etape'
interface Props {
  id: EtapeId
  etapeTypeId: EtapeTypeId
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeId
  titreNom: string
  close: () => void
  apiClient: Pick<EtapeApiClient, 'deleteEtape'>
}

export const RemoveEtapePopup: FunctionalComponent<Props> = props => {
  const deleteEtape = async () => {
    await props.apiClient.deleteEtape(props.id)
  }
  const content = () => (
    <Alert
      type="warning"
      title="Attention : cette opération est définitive et ne peut pas être annulée."
      description={
        <>
          Souhaitez vous supprimer l'étape <span class="fr-text--bold">{EtapesTypes[props.etapeTypeId].nom}</span> de la démarche{' '}
          <span class="fr-text--bold">{DemarchesTypes[props.demarcheTypeId].nom}</span> du titre{' '}
          <span class="fr-text--bold">
            {props.titreNom} ({TitresTypesTypes[getTitreTypeType(props.titreTypeId)].nom})
          </span>{' '}
          ?
        </>
      }
    />
  )

  return <FunctionalPopup title={`Suppression de l'étape`} content={content} close={props.close} validate={{ action: deleteEtape, text: 'Supprimer' }} canValidate={true} />
}
