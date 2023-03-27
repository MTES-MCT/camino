import { getTitreTypeType, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { capitalize, FunctionalComponent } from 'vue'

interface Props {
  titreTypeId: TitreTypeId
}
export const TitreTypeTypeNom: FunctionalComponent<Props> = props => {
  const titreTypeType = TitresTypesTypes[getTitreTypeType(props.titreTypeId)]

  return <span class="small bold">{capitalize(titreTypeType.nom)}</span>
}
