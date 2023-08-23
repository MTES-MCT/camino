import { GraphQLResolveInfo } from 'graphql'
import { Context } from '../../../types.js'

import { fieldsBuild } from './_fields-build.js'
import { activitesTypesDocumentsTypesGet, activitesTypesGet } from '../../../database/queries/metas-activites.js'
import { isSuper } from 'camino-common/src/roles.js'
import { activitesStatuts as activitesStatutsList } from 'camino-common/src/static/activitesStatuts.js'

const activitesTypes = async (_: never, _context: Context, info: GraphQLResolveInfo) => {
  try {
    const fields = fieldsBuild(info)

    return await activitesTypesGet({ fields })
  } catch (e) {
    console.error(e)

    throw e
  }
}

const activitesStatuts = () => activitesStatutsList

const activitesTypesDocumentsTypes = async (_: never, { user }: Context) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const activitesTypesDocumentsTypes = await activitesTypesDocumentsTypesGet()

    return activitesTypesDocumentsTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}

export { activitesTypes, activitesStatuts, activitesTypesDocumentsTypes }
