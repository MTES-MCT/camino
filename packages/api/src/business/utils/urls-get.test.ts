import { ActivitesUrlGetParams, activitesUrlGet } from './urls-get.js'
import { describe, test, expect } from 'vitest'
import { toCaminoAnnee } from 'camino-common/src/date.js'

describe('activitesUrlGet', () => {
  test.each<[ActivitesUrlGetParams, string]>([
    [{ activiteTypesIds: ['gra'] }, 'http://plop.plop/activites?page=1&intervalle=200&ordre=asc&activiteTypesIds=gra'],
    [{ activiteTypesIds: ['gra', 'grp'] }, 'http://plop.plop/activites?page=1&intervalle=200&ordre=asc&activiteTypesIds=gra%2Cgrp'],
    [{ activiteTypesIds: ['gra'], annees: [toCaminoAnnee(2010)] }, 'http://plop.plop/activites?page=1&intervalle=200&ordre=asc&activiteTypesIds=gra&annees=2010'],
  ])('test la construction de l url des activités', (params, url) => {
    expect(activitesUrlGet(params)).toEqual(url)
  })
})
