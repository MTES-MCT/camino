import { createApp } from 'vue'
import { createStore } from 'vuex'
import * as api from '../api/entreprises'
import entreprise from './entreprise'
import { vi, describe, expect, beforeEach, test } from 'vitest'

vi.mock('../router', () => ({
  push: () => {},
  replace: () => {},
}))

vi.mock('../api/entreprises', () => ({
  entreprise: vi.fn(),
  entrepriseCreer: vi.fn(),
}))

console.info = vi.fn()

describe("état de l'entreprise sélectionnée", () => {
  let store
  let actions
  let mutations

  beforeEach(() => {
    entreprise.state = {
      element: null,
      metas: {
        domaines: [],
      },
    }
    actions = {
      pageError: vi.fn(),
      apiError: vi.fn(),
      reload: vi.fn(),
      messageAdd: vi.fn(),
    }

    mutations = {
      loadingAdd: vi.fn(),
      loadingRemove: vi.fn(),
      popupLoad: vi.fn(),
      popupMessagesRemove: vi.fn(),
      popupClose: vi.fn(),
      popupMessageAdd: vi.fn(),
      messageAdd: vi.fn(),
    }

    store = createStore({
      modules: { entreprise },
      mutations,
      actions,
    })

    const app = createApp({})
    app.use(store)
  })

  test('obtient une entreprise', async () => {
    const apiMock = api.entreprise.mockResolvedValue({ id: 71, nom: 'toto' })
    await store.dispatch('entreprise/get', 71)

    expect(apiMock).toHaveBeenCalledWith({ id: 71 })
    expect(store.state.entreprise.element).toEqual({ id: 71, nom: 'toto' })
  })

  test("affiche une page d'erreur si l'id de l'entreprise retourne null", async () => {
    const apiMock = api.entreprise.mockResolvedValue(null)
    await store.dispatch('entreprise/get', 71)

    expect(apiMock).toHaveBeenCalledWith({ id: 71 })
    expect(actions.pageError).toHaveBeenCalled()
  })

  test("retourne une erreur de l'api dans l'obtention de l'entreprise", async () => {
    const apiMock = api.entreprise.mockRejectedValue(new Error("l'api ne répond pas"))
    await store.dispatch('entreprise/get', 71)

    expect(apiMock).toHaveBeenCalledWith({ id: 71 })

    expect(actions.apiError).toHaveBeenCalled()
  })

  test("supprime les données d'entreprise", () => {
    store.commit('entreprise/set', { id: 71, nom: 'toto' })
    store.commit('entreprise/reset')

    expect(store.state.entreprise.element).toBeNull()
  })

  test('ajoute une entreprise', async () => {
    const apiMock = api.entrepriseCreer.mockResolvedValue({
      id: 71,
      nom: 'toto',
    })

    await store.dispatch('entreprise/add', {
      legalSiren: '123456789',
      paysId: 'fr',
    })

    expect(apiMock).toHaveBeenCalledWith({
      entreprise: {
        legalSiren: '123456789',
        paysId: 'fr',
      },
    })
    expect(mutations.popupClose).toHaveBeenCalled()
  })

  test("retourne une erreur si l'API retourne une erreur lors de l'ajout d'une entreprise", async () => {
    const apiMock = api.entrepriseCreer.mockRejectedValue(new Error('erreur api'))
    await store.dispatch('entreprise/add', {
      legalSiren: '123456789',
      paysId: 'fr',
    })

    expect(apiMock).toHaveBeenCalledWith({
      entreprise: {
        legalSiren: '123456789',
        paysId: 'fr',
      },
    })

    expect(mutations.popupMessageAdd).toHaveBeenCalled()
  })
})
