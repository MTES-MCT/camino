import titreEtape from './titre-etape'
import * as api from '../api/titres-etapes'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { vi, describe, expect, beforeEach, test } from 'vitest'

vi.mock('../api/titres-etapes', () => ({
  etape: vi.fn(),
  etapeDeposer: vi.fn(),
}))

console.info = vi.fn()

describe('étapes', () => {
  let store
  let actions
  let mutations

  beforeEach(() => {
    titreEtape.state = {
      element: null,
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
      apiError: vi.fn(),
      popupLoad: vi.fn(),
      fileLoad: vi.fn(),
      popupMessagesRemove: vi.fn(),
      popupClose: vi.fn(),
      popupMessageAdd: vi.fn(),
    }

    store = createStore({
      actions,
      mutations,
      modules: {
        titreEtape,
        titre: { namespaced: true, mutations: { open: vi.fn() } },
      },
    })

    const app = createApp({})
    app.use(store)
  })

  test('dépose une étape', async () => {
    const apiMock = api.etapeDeposer.mockResolvedValue(14)
    await store.dispatch('titreEtape/depose', 14)

    expect(apiMock).toHaveBeenCalledWith({ id: 14 })
    expect(mutations.popupClose).toHaveBeenCalled()
  })

  test("retourne une erreur si l'API retourne une erreur lors du dépot d'une étape", async () => {
    const apiMock = api.etapeDeposer.mockRejectedValue(new Error("erreur de l'api"))
    await store.dispatch('titreEtape/depose', 14)

    expect(apiMock).toHaveBeenCalledWith({ id: 14 })
    expect(mutations.popupMessageAdd).toHaveBeenCalled()
  })
})
