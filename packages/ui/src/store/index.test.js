import { actions, mutations } from './index'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { vi, describe, expect, beforeEach, test } from 'vitest'

vi.mock('file-saver', () => ({ saveAs: vi.fn() }))
vi.mock('./titre', () => ({ default: { titre: vi.fn() } }))
vi.mock('./titre-creation', () => ({ default: { titreCreation: vi.fn() } }))
vi.mock('./titre-etape-edition', () => ({ default: { titreEtape: vi.fn() } }))
vi.mock('./titres-demarches', () => ({ default: { titresDemarches: vi.fn() } }))
vi.mock('./utilisateur', () => ({ default: { utilisateur: vi.fn() } }))
vi.mock('./administration', () => ({ default: { administration: vi.fn() } }))
vi.mock('./user', () => ({ default: { user: vi.fn() } }))
vi.mock('./titre-activite', () => ({ default: { titreActivite: vi.fn() } }))
vi.mock('./statistiques', () => ({ default: { statistiques: vi.fn() } }))
vi.mock('./definitions', () => ({ default: { definitions: vi.fn() } }))
vi.mock('./meta', () => ({ default: { meta: vi.fn() } }))

vi.mock('../router', () => ({
  default: {
    replace: vi.fn(),
    push: vi.fn(),
  },
}))

console.info = vi.fn()
console.error = vi.fn()

describe("état général de l'application", () => {
  let state
  let store
  let modules

  beforeEach(() => {
    vi.resetAllMocks()
    modules = {
      titre: {
        namespaced: true,
        state: { element: null },
        actions: {
          get: vi.fn(),
        },
      },
      route: {
        namespaced: true,
        state: {
          query: {},
        },
      },
    }

    state = {
      config: {},
      messages: [],
      popup: { component: null, props: null, messages: [], loading: false },
      error: null,
      loading: [],
      loaded: false,
      fileLoading: {
        loaded: 0,
        total: 0,
      },
    }

    store = createStore({
      modules,
      state,
      actions,
      mutations,
    })

    const app = createApp({})
    app.use(store)

    localStorage.clear()
  })

  test('ajoute un message', () => {
    const message = { id: 42, message: 'message très important' }
    store.commit('messageAdd', message)

    expect(state.messages).toEqual([message])
  })

  test('met la popup en état de chargement', () => {
    store.commit('popupLoad')

    expect(state.popup.loading).toBe(true)
  })

  test('supprime un message', () => {
    const message = { id: 42, message: 'message très important' }
    store.commit('messageAdd', message)
    store.commit('messageRemove', 42)

    expect(state.messages).toEqual([])
  })

  test('ferme la pop-up', () => {
    const component = 'open'
    const props = 'open'
    store.commit('popupOpen', { component, props })
    store.commit('popupClose')

    expect(state.popup).toMatchObject({
      component: { _value: null },
      props: null,
      messages: [],
      loading: false,
    })
  })

  test('ajoute un message de la pop-up', () => {
    const message = 'message très important'
    store.commit('popupMessageAdd', message)

    expect(state.popup.messages).toEqual([message])
  })

  test('supprime les messages de la pop-up', () => {
    const message = 'message très important'
    store.commit('popupMessageAdd', message)
    store.commit('popupMessagesRemove')

    expect(state.popup.messages).toEqual([])
  })

  test("trace si un appel à l'api est en cours", () => {
    store.commit('loadingAdd', 'nom1')
    store.commit('loadingAdd', 'nom2')
    store.commit('loadingRemove', 'nom2')
    store.commit('loadingRemove', 'nom3')

    expect(state.loading).toEqual(['nom1'])
  })

  test("retourne une erreur de l'api", async () => {
    Date.now = vi.fn(() => 1487076708000)
    await store.dispatch('apiError', 'message')

    expect(state.messages).toEqual([
      {
        id: 1487076708000,
        type: 'error',
        value: 'Erreur : message',
      },
    ])
  })

  test('retourne une erreur 404', async () => {
    await store.dispatch('pageError', null)

    expect(state.error).toEqual({
      type: 'error',
      value: `Erreur: page introuvable`,
    })
  })

  test("ne supprime pas d'erreur s'il n'y en a pas", async () => {
    await store.dispatch('errorRemove')

    expect(state.error).toEqual(null)
  })

  test('supprime une erreur', async () => {
    store.commit('errorUpdate', { id: 'erreur-test' })
    await store.dispatch('errorRemove')

    expect(state.error).toEqual(null)
  })
})

describe("état général de l'application", () => {
  let state
  let store

  beforeEach(() => {
    state = {
      messages: [],
      loading: [],
      fileLoading: {
        loaded: 0,
        total: 0,
      },
    }

    localStorage.clear()
  })

  test('supprime un message', async () => {
    vi.useFakeTimers()
    vi.setSystemTime('2022-01-01')
    const messageRemoveMock = vi.fn()
    mutations.messageRemove = messageRemoveMock
    store = createStore({ actions, state, mutations })
    const message = { id: 14, message: 'message important' }
    await store.dispatch('messageAdd', message)

    const res = state.messages.pop()
    expect(res.message).toEqual('message important')
    expect(res.id).toBeLessThanOrEqual(Date.now())
    vi.advanceTimersByTime(4500)
    // expect(setTimeout).toHaveBeenCalled()
    // expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4500)
    expect(messageRemoveMock).toHaveBeenCalled()
  })
})
