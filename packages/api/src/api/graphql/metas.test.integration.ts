import { dbManager } from '../../../tests/db-manager'
import { graphQLCall, queryImport } from '../../../tests/_utils/index'

import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest'

console.info = vi.fn()
console.error = vi.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('statuts', () => {
  const metasQuery = queryImport('metas')

  test('peut voir tous les statuts', async () => {
    const res = await graphQLCall(metasQuery, {}, 'super')

    expect(res.body.data.statuts).toEqual([
      { id: 'dmi', nom: 'demande initiale', couleur: 'warning' },
      { id: 'dmc', nom: 'demande classée', couleur: 'neutral' },
      { id: 'val', nom: 'valide', couleur: 'success' },
      { id: 'mod', nom: 'modification en instance', couleur: 'warning' },
      { id: 'ech', nom: 'échu', couleur: 'neutral' },
      { id: 'ind', nom: 'indéterminé', couleur: 'warning' }
    ])

    expect(res.body.data.domaines).toEqual([
      { id: 'm', nom: 'minéraux et métaux' },
      { id: 'w', nom: 'granulats marins' },
      { id: 'c', nom: 'carrières' },
      { id: 'h', nom: 'hydrocarbures liquides ou gazeux' },
      { id: 'f', nom: 'combustibles fossiles' },
      { id: 'r', nom: 'éléments radioactifs' },
      { id: 'g', nom: 'géothermie' },
      { id: 's', nom: 'stockages souterrains' },
      { id: 'i', nom: 'indéterminé' }
    ])

    expect(res.body.data).toMatchSnapshot()
  })
})
