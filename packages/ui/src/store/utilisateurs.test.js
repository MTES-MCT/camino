import utilisateurs from './utilisateurs'
import { createApp } from 'vue'
import { createStore } from 'vuex'

jest.mock('../api/utilisateurs', () => ({
  utilisateurs: jest.fn(),
  utilisateurMetas: jest.fn()
}))

console.info = jest.fn()

describe('liste des utilisateurs', () => {
  let store

  beforeEach(() => {
    utilisateurs.state = {
      metas: {
        entreprise: []
      },
      definitions: [
        { id: 'roles', type: 'strings', values: [] },
        { id: 'administrationIds', type: 'strings', values: [] },
        { id: 'entrepriseIds', type: 'strings', values: [] }
      ]
    }

    store = createStore({
      modules: {
        utilisateurs,
        titre: {
          namespaced: true,
          actions: {
            openTab: jest.fn()
          }
        }
      }
    })

    const app = createApp({})
    app.use(store)
  })

  test('enregistre les métas', () => {
    const entreprisesElements = [
      {
        id: 'fr-513863217',
        nom: "SOCIETE GUYANAISE DES MINES D'OR (SOGUMINOR)"
      },
      { id: 'fr-821136710', nom: 'SASU SOFERRO (SOFERRO)' }
    ]
    const entreprises = {
      elements: entreprisesElements,
      total: 4
    }

    store.commit('utilisateurs/metasSet', {
      entreprises,
      truc: {}
    })

    expect(store.state.utilisateurs.metas).toEqual({
      entreprise: entreprises.elements
    })

    expect(store.state.utilisateurs.definitions).toEqual([
      { id: 'roles', type: 'strings', values: [] },
      {
        id: 'administrationIds',
        type: 'strings',
        values: []
      },
      {
        id: 'entrepriseIds',
        type: 'strings',
        values: ['fr-513863217', 'fr-821136710']
      }
    ])
  })
})
