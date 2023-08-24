import { GraphQLResolveInfo } from 'graphql'
import { Context } from '../../../types.js'

import { fieldsBuild } from './_fields-build.js'
import { activitesTypesGet } from '../../../database/queries/metas-activites.js'
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

export { activitesTypes, activitesStatuts }
