import { activitesUrlGet } from './urls-get.js'
import { describe, test, expect } from 'vitest'
import { CaminoAnnee, toCaminoAnnee } from 'camino-common/src/date.js'

describe('activitesUrlGet', () => {
  test.each<[{ typesIds?: string[]; statutsIds?: string[]; annees?: CaminoAnnee[] } | undefined, string]>([
    [undefined, 'https://camino.beta.gouv.fr/activites?page=1&intervalle=200&ordre=asc'],
    [{ typesIds: ['toto'] }, 'https://camino.beta.gouv.fr/activites?page=1&intervalle=200&ordre=asc&typesIds=toto'],
    [{ typesIds: ['toto', 'tata'] }, 'https://camino.beta.gouv.fr/activites?page=1&intervalle=200&ordre=asc&typesIds=toto%2Ctata'],
    [{ typesIds: ['toto'], annees: [toCaminoAnnee(2010)] }, 'https://camino.beta.gouv.fr/activites?page=1&intervalle=200&ordre=asc&typesIds=toto&annees=2010'],
  ])('test la construction de l url des activités', (params, url) => {
    expect(activitesUrlGet(params)).toEqual(url)
  })
})
