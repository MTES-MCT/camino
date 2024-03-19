import { CaminoAnnee } from 'camino-common/src/date.js'
import { config } from '../../config/index.js'

export const titreUrlGet = (titreId: string) => `${config().OAUTH_URL}/titres/${titreId}`

export const activitesUrlGet = (params?: { typesIds?: string[]; statutsIds?: string[]; annees?: CaminoAnnee[] }): string => {
  const url = new URL(`${config().OAUTH_URL}/activites`)

  url.searchParams.append('page', '1')
  url.searchParams.append('intervalle', '200')
  url.searchParams.append('ordre', 'asc')

  if (params && Object.keys(params).length) {
    Object.entries(params).forEach(([key, values]) => url.searchParams.append(key, values.join(',')))
  }

  return url.href
}
