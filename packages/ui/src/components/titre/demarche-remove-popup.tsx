import { DemarchesTypes, DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { isTitreType, TitresTypes, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { defineComponent } from 'vue'
import { useStore } from 'vuex'
import { FunctionalPopup } from '../_ui/functional-popup'
import { DemarcheApiClient } from './demarche-api-client'

export interface Props {
  titreTypeId: TitreTypeId
  titreNom: string
  titreId: string
  demarcheTypeId: DemarcheTypeId
  demarcheId: string
  close: () => void
  apiClient: Pick<DemarcheApiClient, 'deleteDemarche'>
  reload: () => void
  displayMessage: () => void
}

export const DemarcheRemovePopup = defineComponent<Omit<Props, 'reload' | 'displayMessage'>>({
  props: ['titreTypeId', 'titreId', 'titreNom', 'demarcheTypeId', 'demarcheId', 'close', 'apiClient'] as unknown as undefined,
  setup(props) {
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
  },
})

export const PureDemarcheRemovePopup = (props: Omit<Props, 'titreId'>): JSX.Element => {
  const titreTypeNom: string = isTitreType(props.titreTypeId) ? TitresTypesTypes[TitresTypes[props.titreTypeId].typeId].nom : ''

  const content = () => (
    <>
      <p class="bold">
        Souhaitez vous supprimer la démarche
        <span> {DemarchesTypes[props.demarcheTypeId].nom}</span> du titre
        <span> {props.titreNom} </span> (<span>{titreTypeNom}</span>) ?
      </p>
      <div class="bg-warning color-bg p-s mb-l">
        <span class="bold"> Attention </span>: cette opération est définitive et ne peut pas être annulée.
      </div>
    </>
  )

  const deleteDemarche = async () => {
    await props.apiClient.deleteDemarche(props.demarcheId)
    props.displayMessage()
    props.reload()
  }

  return <FunctionalPopup title="Suppression de la démarche" content={content} close={props.close} validate={{ action: deleteDemarche, text: 'Supprimer' }} />
}
