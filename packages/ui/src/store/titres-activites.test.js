import titresActivites, { anneesGet } from './titres-activites'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { vi, describe, expect, beforeEach, test } from 'vitest'

vi.mock('../api/titres-activites', () => ({
  activites: vi.fn()
}))

vi.mock('../api/metas-activites', () => ({
  activitesMetas: vi.fn()
}))

console.info = vi.fn()

describe("état d'une activité", () => {
  let store

  beforeEach(() => {
    titresActivites.state = {
      metas: {
        types: [],
        statuts: [],
        titresTypes: [],
        titresStatuts: []
      },
      definitions: [
        { id: 'typesIds', type: 'strings', values: [] },
        { id: 'statutsIds', type: 'strings', values: [] },
        { id: 'titresTypesIds', type: 'strings', values: [] },
        { id: 'titresDomainesIds', type: 'strings', values: [] },
        { id: 'titresStatutsIds', type: 'strings', values: [] }
      ]
    }

    store = createStore({
      modules: { titresActivites }
    })

    const app = createApp({})
    app.use(store)
  })

  test('enregistre les métas', () => {
    const activitesTypes = [
      { id: 'grp', nom: "rapport trimestriel d'activité" }
    ]
    const activitesStatuts = [
      { id: 'abs', nom: 'absent', couleur: 'error' },
      { id: 'enc', nom: 'en construction', couleur: 'warning' },
      { id: 'dep', nom: 'déposé', couleur: 'success' },
      { id: 'fer', nom: 'cloturé', couleur: 'neutral' }
    ]

    const statuts = [
      { id: 'val', nom: 'valide', couleur: 'success' },
      { id: 'ech', nom: 'échu', couleur: 'neutral' }
    ]
    const types = [
      { id: 'cx', nom: 'concession', exploitation: true },
      { id: 'pr', nom: 'permis exclusif de recherches', exploitation: false }
    ]

    store.commit('titresActivites/metasSet', {
      activitesTypes,
      activitesStatuts,
      statuts,
      types,
      truc: {}
    })

    expect(store.state.titresActivites.metas).toEqual({
      types: activitesTypes,
      statuts: activitesStatuts,
      titresTypes: types,
      titresStatuts: statuts
    })

    expect(store.state.titresActivites.definitions).toEqual([
      { id: 'typesIds', type: 'strings', values: ['grp'] },
      {
        id: 'statutsIds',
        type: 'strings',
        values: ['abs', 'enc', 'dep', 'fer']
      },
      { id: 'titresTypesIds', type: 'strings', values: ['cx', 'pr'] },
      { id: 'titresDomainesIds', type: 'strings', values: [] },
      { id: 'titresStatutsIds', type: 'strings', values: ['val', 'ech'] }
    ])
  })

  test('anneesGet', () => {
    expect(anneesGet(2003)).toEqual([
      { id: 2003, nom: 2003 },
      { id: 2002, nom: 2002 },
      { id: 2001, nom: 2001 },
      { id: 2000, nom: 2000 },
      { id: 1999, nom: 1999 },
      { id: 1998, nom: 1998 },
      { id: 1997, nom: 1997 }
    ])
  })
})
