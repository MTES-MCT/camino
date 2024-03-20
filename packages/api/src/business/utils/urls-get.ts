import { config } from '../../config/index.js'
import { GetActivitesInput } from './filters.js'

export const titreUrlGet = (titreId: string) => `${config().OAUTH_URL}/titres/${titreId}`

export type ActivitesUrlGetParams = Pick<GetActivitesInput, 'activiteTypesIds' | 'activiteStatutsIds' | 'annees'>

export const activitesUrlGet = (params: ActivitesUrlGetParams): string => {
  const url = new URL(`${config().OAUTH_URL}/activites`)

  url.searchParams.append('page', '1')
  url.searchParams.append('intervalle', '200')
  url.searchParams.append('ordre', 'asc')

  if (Object.keys(params).length) {
    Object.entries(params).forEach(([key, values]) => url.searchParams.append(key, values.join(',')))
  }

  return url.href
}
