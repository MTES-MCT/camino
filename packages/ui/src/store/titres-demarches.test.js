import titresDemarches from './titres-demarches'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { vi, describe, expect, beforeEach, test } from 'vitest'

vi.mock('../api/titres-demarches', () => ({
  demarchesMetas: vi.fn(),
  demarches: vi.fn(),
}))

console.info = vi.fn()

describe('liste des demarches', () => {
  let store

  beforeEach(() => {
    titresDemarches.state = {
      metas: {
        etapesTypes: [],
        titresTypes: [],
        titresStatuts: [],
      },
      definitions: [
        { id: 'statutsIds', type: 'strings', values: [] },
        { id: 'etapesInclues', type: 'objects', values: [] },
        { id: 'etapesExclues', type: 'objects', values: [] },
        { id: 'titresDomainesIds', type: 'strings', values: [] },
        { id: 'titresTypesIds', type: 'strings', values: [] },
        { id: 'titresStatutsIds', type: 'strings', values: [] },
      ],
    }

    store = createStore({
      modules: { titresDemarches },
    })

    const app = createApp({})
    app.use(store)
  })

  test('enregistre les métas', () => {
    const statuts = [
      { id: 'val', nom: 'valide', couleur: 'success' },
      { id: 'ech', nom: 'échu', couleur: 'neutral' },
    ]
    const types = [
      { id: 'cx', nom: 'concession', exploitation: true },
      { id: 'pr', nom: 'permis exclusif de recherches', exploitation: false },
    ]
    const etapesTypes = [{ id: 'dpu', nom: 'publication au Jorf' }]

    store.commit('titresDemarches/metasSet', {
      statuts,
      types,
      etapesTypes,
      truc: {},
    })

    expect(store.state.titresDemarches.metas).toEqual({
      titresTypes: types,
      titresStatuts: statuts,
      etapesTypes,
    })

    expect(store.state.titresDemarches.definitions).toEqual([
      { values: [], id: 'statutsIds', type: 'strings' },
      { values: ['dpu'], id: 'etapesInclues', type: 'objects' },
      { values: ['dpu'], id: 'etapesExclues', type: 'objects' },
      { values: [], id: 'titresDomainesIds', type: 'strings' },
      { values: ['cx', 'pr'], id: 'titresTypesIds', type: 'strings' },
      { values: ['val', 'ech'], id: 'titresStatutsIds', type: 'strings' },
    ])
  })
})
