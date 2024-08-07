import { journauxGet } from '../../../database/queries/journaux'
import { GraphQLResolveInfo } from 'graphql'
import { fieldsBuild } from './_fields-build'
import { Context } from '../../../types'
import { canReadJournaux } from 'camino-common/src/permissions/journaux'
import { Journaux, JournauxQueryParams } from 'camino-common/src/journaux'

export const journaux = async (params: JournauxQueryParams, { user }: Context, info: GraphQLResolveInfo): Promise<Journaux> => {
  try {
    if (!canReadJournaux(user)) {
      return { elements: [], page: 1, total: 0 }
    }
    const fields = fieldsBuild(info)

    const { results, total } = await journauxGet(params, { fields: fields.elements }, user)

    if (!results.length) return { elements: [], page: 1, total: 0 }

    return {
      elements: results,
      page: params.page,
      total,
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}
