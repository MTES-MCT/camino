import { DomaineId } from 'camino-common/src/static/domaines'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'

export interface Titre {
  id: string
  nom: string
  domaine: {
    id: DomaineId
  }
  type: {
    type: {
      id: TitreTypeTypeId
    }
  }
}
