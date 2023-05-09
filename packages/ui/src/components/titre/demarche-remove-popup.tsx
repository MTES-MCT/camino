import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { DemarchesTypes, DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { isTitreType, TitresTypes, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { useStore } from 'vuex'
import { FunctionalPopup } from '../_ui/functional-popup'
import { DemarcheApiClient } from './demarche-api-client'
import { Alert } from '@/components/_ui/alert'
import { DemarcheId } from 'camino-common/src/demarche'
import { FunctionalComponent } from 'vue'

export interface Props {
  titreTypeId: TitreTypeId
  titreNom: string
  titreId: string
  demarcheTypeId: DemarcheTypeId
  demarcheId: DemarcheId
  close: () => void
  apiClient: Pick<DemarcheApiClient, 'deleteDemarche'>
  reload: () => void
  displayMessage: () => void
}

export const DemarcheRemovePopup = caminoDefineComponent<Omit<Props, 'reload' | 'displayMessage'>>(
  ['titreTypeId', 'titreNom', 'titreId', 'demarcheTypeId', 'demarcheId', 'close', 'apiClient'],
  props => {
    const store = useStore()
    return () => (
      <PureDemarcheRemovePopup
        titreTypeId={props.titreTypeId}
        titreNom={props.titreNom}
        demarcheTypeId={props.demarcheTypeId}
        demarcheId={props.demarcheId}
        close={props.close}
        apiClient={props.apiClient}
        reload={() => store.dispatch('titre/get', props.titreId, { root: true })}
        displayMessage={() => store.dispatch('messageAdd', { value: `le titre a été mis à jour`, type: 'success' }, { root: true })}
      />
    )
  }
)

export const PureDemarcheRemovePopup: FunctionalComponent<Omit<Props, 'titreId'>> = (props): JSX.Element => {
  const titreTypeNom: string = isTitreType(props.titreTypeId) ? TitresTypesTypes[TitresTypes[props.titreTypeId].typeId].nom : ''

  const content = () => (
    <Alert
      type="warning"
      title="Attention : cette opération est définitive et ne peut pas être annulée."
      description={() => (
        <>
          Souhaitez-vous supprimer la démarche <span class="fr-text--bold"> {DemarchesTypes[props.demarcheTypeId].nom}</span> du titre
          <span class="fr-text--bold">
            {' '}
            {props.titreNom} ({titreTypeNom})
          </span>{' '}
          ?
        </>
      )}
    />
  )

  const deleteDemarche = async () => {
    await props.apiClient.deleteDemarche(props.demarcheId)
    props.displayMessage()
    props.reload()
  }

  return <FunctionalPopup title="Suppression de la démarche" content={content} close={props.close} validate={{ action: deleteDemarche, text: 'Supprimer' }} />
}
