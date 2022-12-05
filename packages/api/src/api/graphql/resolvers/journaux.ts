import { journauxGet } from '../../../database/queries/journaux.js'
import { userGet } from '../../../database/queries/utilisateurs.js'
import { IToken } from '../../../types.js'
import { GraphQLResolveInfo } from 'graphql'
import { fieldsBuild } from './_fields-build.js'

export interface IJournauxQueryParams {
  page: number
  intervalle: number
  recherche: string
  titreId: string
}

export const journaux = async (
  params: IJournauxQueryParams,
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)
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
