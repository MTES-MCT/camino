import definitions from './definitions'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { vi, describe, expect, beforeEach, test } from 'vitest'

vi.mock('../api/metas', () => ({
  definitions: vi.fn(),
  domaines: vi.fn(),
  demarchesStatuts: vi.fn(),
  demarchesTypes: vi.fn(),
  etapesTypes: vi.fn(),
  substancesLegales: vi.fn(),
  titresStatuts: vi.fn(),
  titresTypesTypes: vi.fn()
}))

console.info = vi.fn()

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
      pageError: vi.fn(),
      apiError: vi.fn(),
      messageAdd: vi.fn()
    }
    mutations = {
      loadingAdd: vi.fn(),
      loadingRemove: vi.fn(),
      popupMessagesRemove: vi.fn(),
      popupMessageAdd: vi.fn(),
      popupClose: vi.fn()
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
