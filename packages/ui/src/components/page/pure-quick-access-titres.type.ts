import { DomaineId } from 'camino-common/src/domaines'
import { TitresTypesTypesId } from 'camino-common/src/titresTypesTypes'

export interface Titre {
  id: string
  nom: string
  domaine: {
    id: DomaineId
  }
  type: {
    type: {
      id: TitresTypesTypesId
    }
  }
}
