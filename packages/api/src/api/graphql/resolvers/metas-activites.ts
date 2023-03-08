import { GraphQLResolveInfo } from 'graphql'
import { Context } from '../../../types.js'

import { fieldsBuild } from './_fields-build.js'
import { activitesTypesDocumentsTypesGet, activitesTypesGet, activitesTypesPaysGet, activitesTypesTitresTypesGet } from '../../../database/queries/metas-activites.js'
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

const activitesTypesTitresTypes = async (_: never, { user }: Context) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const activitesTypesTitresTypes = await activitesTypesTitresTypesGet()

    return activitesTypesTitresTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}

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

const activitesTypesPays = async (_: never, { user }: Context) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const activitesTypesPays = await activitesTypesPaysGet()

    return activitesTypesPays
  } catch (e) {
    console.error(e)

    throw e
  }
}

export { activitesTypes, activitesStatuts, activitesTypesTitresTypes, activitesTypesDocumentsTypes, activitesTypesPays }
