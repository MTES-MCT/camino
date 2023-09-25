import titre from './titre'
import * as api from '../api/titres'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { vi, describe, expect, beforeEach, test } from 'vitest'
import { testBlankUser } from 'camino-common/src/tests-utils'

vi.mock('../router', () => ({
  push: () => {},
}))

vi.mock('../api/titres', () => ({
  titreMetas: vi.fn(),
  titre: vi.fn(),
  titreCreer: vi.fn(),
}))

console.info = vi.fn()

describe('état du titre sélectionné', () => {
  let store
  let actions
  let mutations

  beforeEach(() => {
    titre.state = {
      element: null,
      metas: {
        referencesTypes: [],
      },
      opened: {
        etapes: {},
        activites: { 'activite-id': false },
        travaux: {},
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
    }

    store = createStore({
      modules: { titre },
      actions,
      mutations,
    })

    const app = createApp({})
    app.use(store)
  })

  test('retourne un titre', async () => {
    const apiMock = api.titre.mockResolvedValue({ id: 83, nom: 'marne' })
    await store.dispatch('titre/get', 83)

    expect(apiMock).toHaveBeenCalledWith({ id: 83 })
    expect(store.state.titre.element).toEqual({ id: 83, nom: 'marne' })
  })

  test("affiche une page d'erreur si l'id du titre retourne null", async () => {
    const apiMock = api.titre.mockResolvedValue(null)
    await store.dispatch('titre/get', 27)

    expect(apiMock).toHaveBeenCalledWith({ id: 27 })
    expect(actions.pageError).toHaveBeenCalled()
  })

  test("retourne une erreur si de l'api ne répond pas lors d'une requête sur un titre", async () => {
    api.titre.mockRejectedValue(new Error("erreur de l'api"))
    await store.dispatch('titre/get', 83)

    expect(store.state.titre.element).toEqual(null)
    expect(actions.apiError).toHaveBeenCalled()
  })

  test('crée un titre', async () => {
    api.titreCreer.mockResolvedValue({ id: 83, nom: 'marne' })
    await store.dispatch('titre/add', { id: 83, nom: 'marne' })

    expect(mutations.popupClose).toHaveBeenCalled()
  })

  test("retourne une erreur si l'API retourne une erreur lors de la création dun titre", async () => {
    api.titreCreer.mockRejectedValue(new Error('erreur api'))
    await store.dispatch('titre/add', { id: 83, nom: 'marne' })

    expect(mutations.popupMessageAdd).toHaveBeenCalled()
  })

  test('supprime le titre courant', () => {
    store.commit('titre/set', 83)
    store.commit('titre/reset')

    expect(store.state.titre.element).toBeNull()
  })

  test("permute l'ouverture une section", () => {
    expect(store.state.titre.opened.activites['activite-id']).toBeFalsy()
    store.commit('titre/toggle', { section: 'activites', id: 'activite-id' })

    expect(store.state.titre.opened.activites['activite-id']).toBeTruthy()

    store.commit('titre/toggle', { section: 'activites', id: 'activite-id' })

    expect(store.state.titre.opened.activites['activite-id']).toBeFalsy()
  })
})
