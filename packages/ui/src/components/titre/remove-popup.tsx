import { getTitreTypeType, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { FunctionalComponent } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
interface Props {
  titreId: string
  titreNom: string
  titreTypeId: TitreTypeId
  close: () => void
  deleteTitre: () => Promise<void>
}

export const RemovePopup: FunctionalComponent<Props> = props => {
  const content = () => (
    <>
      <p class="bold">
        Souhaitez vous supprimer le titre
        <span class="color-inverse">{props.titreNom}</span> (<span class="color-inverse">{TitresTypesTypes[getTitreTypeType(props.titreTypeId)].nom}</span>) ?
      </p>
      <div class="bg-warning color-bg p-s mb-l">
        <span class="bold"> Attention </span>: cette opération est définitive et ne peut pas être annulée.
      </div>
    </>
  )

  return <FunctionalPopup title="Suppression du titre" content={content} close={props.close} validate={{ action: props.deleteTitre, text: 'Supprimer' }} />
}
