import { Context } from '../../../types.js'

import { titresTypesGet, etapesTypesDocumentsTypesGet } from '../../../database/queries/metas.js'
import { GraphQLResolveInfo } from 'graphql'
import { fieldsBuild } from './_fields-build.js'
import { isSuper } from 'camino-common/src/roles.js'
import { titreTypesStatutsTitresPublicLecture } from 'camino-common/src/static/titresTypes_titresStatuts.js'

export const titresTypes = async (_: never, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const fields = fieldsBuild(info)

    const titresTypes = await titresTypesGet(null as never, { fields })

    return titresTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}

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
