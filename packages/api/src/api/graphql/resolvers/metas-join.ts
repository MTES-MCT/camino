import { Context } from '../../../types.js'

import { etapesTypesDocumentsTypesGet } from '../../../database/queries/metas.js'
import { isSuper } from 'camino-common/src/roles.js'
import { titreTypesStatutsTitresPublicLecture } from 'camino-common/src/static/titresTypes_titresStatuts.js'
import { TitresTypes } from 'camino-common/src/static/titresTypes.js'

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
