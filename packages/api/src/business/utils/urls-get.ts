import { CaminoAnnee } from 'camino-common/src/date.js'

export const titreUrlGet = (titreId: string) => `${process.env.OAUTH_URL}/titres/${titreId}`

export const activiteUrlGet = (activiteId: string) => `${process.env.OAUTH_URL}/activites/${activiteId}`

export const activitesUrlGet = (params?: { typesIds?: string[]; statutsIds?: string[]; annees?: CaminoAnnee[] }): string => {
  const url = new URL(`${process.env.OAUTH_URL ?? 'https://camino.beta.gouv.fr'}/activites`)

  url.searchParams.append('page', '1')
  url.searchParams.append('intervalle', '200')
  url.searchParams.append('ordre', 'asc')

  if (params && Object.keys(params).length) {
    Object.entries(params).forEach(([key, values]) => url.searchParams.append(key, values.join(',')))
  }

  return url.href
}