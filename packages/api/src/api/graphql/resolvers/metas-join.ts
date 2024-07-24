import { Context } from '../../../types'

import { etapesTypesDocumentsTypesGet } from '../../../database/queries/metas'
import { isSuper } from 'camino-common/src/roles'
import { titreTypesStatutsTitresPublicLecture } from 'camino-common/src/static/titresTypes_titresStatuts'
import { TitresTypes } from 'camino-common/src/static/titresTypes'

export const titresTypes = () => Object.values(TitresTypes)

export const titresTypesTitresStatuts = (_: never) => {
  return titreTypesStatutsTitresPublicLecture
}

export const etapesTypesDocumentsTypes = (_: never, { user }: Context) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const etapesTypesDocumentsTypes = etapesTypesDocumentsTypesGet()

    return etapesTypesDocumentsTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}
