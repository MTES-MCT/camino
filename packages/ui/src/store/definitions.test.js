import definitions from './definitions'
import { createApp } from 'vue'
import { createStore } from 'vuex'

jest.mock('../api/metas', () => ({
  definitions: jest.fn(),
  domaines: jest.fn(),
  demarchesStatuts: jest.fn(),
  demarchesTypes: jest.fn(),
  etapesTypes: jest.fn(),
  substancesLegales: jest.fn(),
  titresStatuts: jest.fn(),
  titresTypesTypes: jest.fn()
}))

console.info = jest.fn()

describe('définitions du glossaire', () => {
  let store
  let actions
  let mutations

  beforeEach(() => {
    definitions.state = {
      elements: [],
      entrees: []
    }

    actions = {
      pageError: jest.fn(),
      apiError: jest.fn(),
      messageAdd: jest.fn()
    }
    mutations = {
      loadingAdd: jest.fn(),
      loadingRemove: jest.fn(),
      popupMessagesRemove: jest.fn(),
      popupMessageAdd: jest.fn(),
      popupClose: jest.fn()
    }

    store = createStore({
      modules: { definitions },
      mutations,
      actions
    })

    const app = createApp({})
    app.use(store)
  })

  test('ne récupère pas de description sur la page principale ', async () => {
    await store.dispatch('definitions/entreesGet', '')
    expect(store.state.definitions.entrees).toEqual([])
  })

  test('ne récupère pas de description pour "titre-minier"', async () => {
    await store.dispatch('definitions/entreesGet', 'titre-minier')
    expect(store.state.definitions.entrees).toEqual([])
  })
})
