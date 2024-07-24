import { TitreId } from 'camino-common/src/validators/titres'
import { config } from '../../config/index'
import { GetActivitesInput } from './filters'
import { ActiviteId } from 'camino-common/src/activite'

export const titreUrlGet = (titreId: TitreId): string => `${config().OAUTH_URL}/titres/${titreId}`
export const activiteUrlGet = (activiteId: ActiviteId): string => `${config().OAUTH_URL}/activites/${activiteId}`

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
