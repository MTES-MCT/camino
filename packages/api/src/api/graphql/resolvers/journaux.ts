import { journauxGet } from '../../../database/queries/journaux'
import { debug } from '../../../config'
import { GraphQLResolveInfo } from 'graphql'
import { fieldsBuild } from './_fields-build'
import { Context } from '../../../types'

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
    if (debug) {
      console.error(e)
    }

    throw e
  }
}
