import { journauxGet } from '../../../database/queries/journaux.js'
import { GraphQLResolveInfo } from 'graphql'
import { fieldsBuild } from './_fields-build.js'
import { Context } from '../../../types.js'
import { canReadJournaux } from 'camino-common/src/permissions/journaux.js'

export interface IJournauxQueryParams {
  page: number
  intervalle: number
  recherche: string
  titreId: string
}

export const journaux = async (
  params: IJournauxQueryParams,
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    if (!canReadJournaux(user)) {
      return []
    }
    const fields = fieldsBuild(info)

    const { results, total } = await journauxGet(
      params,
      { fields: fields.elements },
      user
    )

    if (!results.length) return { elements: [], total: 0 }

    return {
      elements: results,
      page: params.page,
      intervalle: params.intervalle,
      total
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}
