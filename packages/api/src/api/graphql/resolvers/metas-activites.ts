import { GraphQLResolveInfo } from 'graphql'
import { IToken } from '../../../types.js'

import { fieldsBuild } from './_fields-build.js'
import { userGet } from '../../../database/queries/utilisateurs.js'
import {
  activitesTypesDocumentsTypesGet,
  activitesTypesGet,
  activitesTypesPaysGet,
  activitesTypesTitresTypesGet
} from '../../../database/queries/metas-activites.js'
import { isSuper } from 'camino-common/src/roles.js'
import { activitesStatuts as activitesStatutsList } from 'camino-common/src/static/activitesStatuts.js'

const activitesTypes = async (
  _: never,
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const fields = fieldsBuild(info)

    return await activitesTypesGet({ fields })
  } catch (e) {
    console.error(e)

    throw e
  }
}

const activitesStatuts = () => activitesStatutsList

const activitesTypesTitresTypes = async (_: never, context: IToken) => {
  try {
    const user = await userGet(context.user?.id)

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

const activitesTypesDocumentsTypes = async (_: never, context: IToken) => {
  try {
    const user = await userGet(context.user?.id)

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

const activitesTypesPays = async (_: never, context: IToken) => {
  try {
    const user = await userGet(context.user?.id)

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

export {
  activitesTypes,
  activitesStatuts,
  activitesTypesTitresTypes,
  activitesTypesDocumentsTypes,
  activitesTypesPays
}
