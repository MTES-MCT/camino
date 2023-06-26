import { journauxGet } from '../../../database/queries/journaux.js'
import { GraphQLResolveInfo } from 'graphql'
import { fieldsBuild } from './_fields-build.js'
import { Context } from '../../../types.js'
import { canReadJournaux } from 'camino-common/src/permissions/journaux.js'
import { Journaux, JournauxQueryParams } from 'camino-common/src/journaux.js'

export const journaux = async (params: JournauxQueryParams, { user }: Context, info: GraphQLResolveInfo): Promise<Journaux> => {
  try {
    if (!canReadJournaux(user)) {
      return { elements: [], page: 1, intervalle: 10, total: 0 }
    }
    const fields = fieldsBuild(info)

    const { results, total } = await journauxGet(params, { fields: fields.elements }, user)

    if (!results.length) return { elements: [], page: 1, intervalle: 10, total: 0 }

    return {
      elements: results,
      page: params.page,
      intervalle: params.intervalle,
      total,
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}
