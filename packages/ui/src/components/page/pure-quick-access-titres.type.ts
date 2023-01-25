import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'

export interface Titre {
  id: string
  nom: string

  typeId: TitreTypeId
  type?: {
    type: {
      id: TitreTypeTypeId
    }
  }
}
