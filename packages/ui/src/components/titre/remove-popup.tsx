import { getTitreTypeType, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { FunctionalComponent } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { Alert } from '@/components/_ui/alert'
import { TitreApiClient } from './titre-api-client'
import { TitreId } from 'camino-common/src/validators/titres'
interface Props {
  titreId: TitreId
  titreNom: string
  titreTypeId: TitreTypeId
  close: () => void
  apiClient: Pick<TitreApiClient, 'removeTitre'>
  reload: () => void
}

export const RemovePopup: FunctionalComponent<Props> = props => {
  const removeTitre = async () => {
    await props.apiClient.removeTitre(props.titreId)
    props.reload()
  }
  const content = () => (
    <Alert
      type="warning"
      title="Attention : cette opération est définitive et ne peut pas être annulée."
      description={
        <>
          Souhaitez-vous supprimer le titre{' '}
          <span class="fr-text--bold">
            {props.titreNom} {TitresTypesTypes[getTitreTypeType(props.titreTypeId)].nom}
          </span>
          ) ?
        </>
      }
    />
  )

  return <FunctionalPopup title="Suppression du titre" content={content} close={props.close} validate={{ action: removeTitre, text: 'Supprimer' }} canValidate={true} />
}
