import { createStore } from 'vuex'
import { createApp } from 'vue'
import * as router from '../router'
import * as api from '../api/utilisateurs'

import utilisateur from './utilisateur'
import { vi, describe, beforeEach, test, expect } from 'vitest'

vi.mock('../api/utilisateurs', () => ({
  utilisateurMetas: vi.fn(),
  utilisateur: vi.fn(),
  utilisateurCreer: vi.fn(),
  utilisateurModifier: vi.fn(),
  utilisateurSupprimer: vi.fn()
}))

vi.mock('../router', () => ({
  default: { push: vi.fn() }
}))

console.info = vi.fn()

describe("état de l'utilisateur consulté", () => {
  let store
  let actions
  let mutations
  let user

  beforeEach(() => {
    utilisateur.state = {
      element: null,
      metas: {
        entreprises: []
      },
      metasLoaded: false
    }
    user = {
      namespaced: true,
      state: {
        element: {}
      },
      actions: {
        logout: vi.fn()
      },
      mutations: {
        set: vi.fn()
      }
    }

    mutations = {
      loadingAdd: vi.fn(),
      loadingRemove: vi.fn(),
      popupMessageAdd: vi.fn(),
      popupClose: vi.fn(),
      popupMessagesRemove: vi.fn(),
      popupLoad: vi.fn()
    }

    actions = {
      pageError: vi.fn(),
      apiError: vi.fn(),
      reload: vi.fn(),
      messageAdd: vi.fn()
    }

    store = createStore({
      modules: { utilisateur, user },
      mutations,
      actions
    })

    const app = createApp({})
    app.use(store)
  })

  test('récupère les métas pour éditer un utilisateur', async () => {
    const apiMock = api.utilisateurMetas.mockResolvedValue({
      elements: ['ent-1']
    })

    await store.dispatch('utilisateur/init')

    expect(apiMock).toHaveBeenCalled()
    expect(store.state.utilisateur.metas).toEqual({
      entreprises: ['ent-1']
    })
    expect(mutations.loadingRemove).toHaveBeenCalled()

    store.commit('utilisateur/metasReset')

    expect(store.state.utilisateur.metasLoaded).toBeFalsy()
  })

  test("retourne une erreur si l'api ne répond pas", async () => {
    const apiMock = api.utilisateurMetas.mockRejectedValue(
      new Error("erreur de l'api")
    )

    await store.dispatch('utilisateur/init')

    expect(apiMock).toHaveBeenCalled()
    expect(mutations.loadingRemove).toHaveBeenCalled()
    expect(mutations.popupMessageAdd).toHaveBeenCalled()
  })

  test("retourne une erreur si l'api répond null", async () => {
    const apiMock = api.utilisateurMetas.mockResolvedValue(null)

    await store.dispatch('utilisateur/init')

    expect(apiMock).toHaveBeenCalled()
  })

  test('retourne un utilisateur', async () => {
    const utilisateur = { id: 71, nom: 'toto', prenom: 'asticot' }
    const apiMock = api.utilisateur.mockResolvedValue(utilisateur)
    await store.dispatch('utilisateur/get', 71)

    expect(apiMock).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({ id: 71 })
    expect(store.state.utilisateur.element).toEqual(utilisateur)
  })

  test("affiche une page d'erreur si l'id de l'utilisateur retourne null", async () => {
    const apiMock = api.utilisateur.mockResolvedValue(null)
    await store.dispatch('utilisateur/get', 27)

    expect(apiMock).toHaveBeenCalledWith({ id: 27 })
    expect(actions.pageError).toHaveBeenCalled()
  })

  test("retourne une erreur de l'api dans l'obtention de l'utilisateur", async () => {
    const apiMock = api.utilisateur.mockRejectedValue(
      new Error("l'api ne répond pas")
    )
    await store.dispatch('utilisateur/get', 71)

    expect(apiMock).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({ id: 71 })

    expect(actions.apiError).toHaveBeenCalled()
  })

  test("supprime les données d'utilisateur", () => {
    store.commit('utilisateur/set', { id: 71, nom: 'toto', prenom: 'asticot' })
    store.commit('utilisateur/reset')

    expect(store.state.utilisateur.element).toBeNull()
  })

  test('ajoute un utilisateur', async () => {
    const apiMock = api.utilisateurCreer.mockResolvedValue({
      id: 71,
      nom: 'toto',
      prenom: 'asticot'
    })
    await store.dispatch('utilisateur/add', {
      id: 71,
      nom: 'toto',
      prenom: 'asticot'
    })

    expect(apiMock).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({
      utilisateur: { id: 71, nom: 'toto', prenom: 'asticot' }
    })
    expect(mutations.popupClose).toHaveBeenCalled()
    expect(actions.messageAdd).toHaveBeenCalled()
  })

  test('ajoute un utilisateur (erreur API)', async () => {
    const apiMock = api.utilisateurCreer.mockRejectedValue(
      new Error('erreur API')
    )
    await store.dispatch('utilisateur/add', {
      id: 71,
      nom: 'toto',
      prenom: 'asticot'
    })

    expect(apiMock).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({
      utilisateur: { id: 71, nom: 'toto', prenom: 'asticot' }
    })
  })

  test('modifie un utilisateur', async () => {
    user.state.element = { id: 72 }
    const apiMock = api.utilisateurModifier.mockResolvedValue({
      id: 71,
      nom: 'Asticot',
      prenom: 'Julien'
    })
    await store.dispatch('utilisateur/update', {
      id: 71,
      nom: 'Asticot',
      prenom: 'Julien'
    })

    expect(apiMock).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({
      utilisateur: { id: 71, nom: 'Asticot', prenom: 'Julien' }
    })
    expect(actions.reload).toHaveBeenCalled()
    expect(user.mutations.set).not.toHaveBeenCalled()
    expect(actions.messageAdd).toHaveBeenCalled()
  })

  test("modifie l'utilisateur actif", async () => {
    user.state.element = { id: 71, nom: 'Ouistiti', prenom: 'Marcel' }
    const apiMock = api.utilisateurModifier.mockResolvedValue({
      id: 71,
      nom: 'Asticot',
      prenom: 'Julien'
    })
    await store.dispatch('utilisateur/update', {
      id: 71,
      nom: 'Asticot',
      prenom: 'Julien'
    })

    expect(apiMock).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({
      utilisateur: { id: 71, nom: 'Asticot', prenom: 'Julien' }
    })
    expect(actions.reload).toHaveBeenCalled()
    expect(user.mutations.set).toHaveBeenCalled()
    expect(actions.messageAdd).toHaveBeenCalled()
  })

  test('modifie un utilisateur (erreur API)', async () => {
    const apiMock = api.utilisateurModifier.mockRejectedValue(
      new Error('erreur API')
    )
    await store.dispatch('utilisateur/update', {
      id: 71,
      nom: 'toto',
      prenom: 'asticot'
    })

    expect(apiMock).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({
      utilisateur: { id: 71, nom: 'toto', prenom: 'asticot' }
    })
    expect(actions.reload).not.toHaveBeenCalled()
    expect(mutations.popupMessageAdd).toHaveBeenCalled()
  })

  test('supprime un utilisateur', async () => {
    const apiMock = api.utilisateurSupprimer.mockResolvedValue({
      id: 71,
      nom: 'toto',
      prenom: 'asticot'
    })
    await store.dispatch('utilisateur/remove', 46)

    expect(apiMock).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({ id: 46 })
    expect(user.actions.logout).not.toHaveBeenCalled()
    expect(actions.messageAdd).toHaveBeenCalled()
    expect(router.default.push).toHaveBeenCalled()
  })

  test('supprime un utilisateur et le déconnecte', async () => {
    const apiMock = api.utilisateurSupprimer.mockResolvedValue({
      id: 71,
      nom: 'toto',
      prenom: 'asticot'
    })

    user.state.element = { id: 71 }
    await store.dispatch('utilisateur/remove', 71)

    expect(apiMock).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({ id: 71 })
    expect(user.actions.logout).toHaveBeenCalled()
    expect(actions.messageAdd).toHaveBeenCalled()
  })

  test("retourne une erreur de l'api dans la suppression de l'utilisateur", async () => {
    const apiMock = api.utilisateurSupprimer.mockRejectedValue(
      new Error("erreur dans l'api")
    )
    await store.dispatch('utilisateur/remove', 46)

    expect(apiMock).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({ id: 46 })
    expect(mutations.popupMessageAdd).toHaveBeenCalled()
  })
})
