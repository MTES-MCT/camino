import { createStore } from 'vuex'
import { createApp } from 'vue'
import * as api from '../api/utilisateurs'
import { fetchWithJson } from '../api/client-rest'
import user from './user'

import { vi, describe, test, beforeEach, expect } from 'vitest'
import { testBlankUser, TestUser } from 'camino-common/src/tests-utils'

vi.mock('../api/utilisateurs', () => ({
  utilisateurCreer: vi.fn(),
  userMetas: vi.fn()
}))

vi.mock('../api/client-rest', () => ({
  fetchWithJson: vi.fn()
}))

vi.mock('../router', () => [])

console.info = vi.fn()

describe("état de l'utilisateur connecté", () => {
  let store
  let actions
  let mutations
  let userInfo
  let map
  let email

  beforeEach(() => {
    email = 'rene@la.taupe'

    userInfo = {
      id: 66,
      prenom: 'rene',
      nom: 'lataupe',
      role: 'admin',
      entreprise: 'macdo',
      email: 'rene@la.taupe'
    }

    user.state = {
      element: null,
      metas: {},
      preferences: {
        carte: {}
      }
    }

    actions = {
      messageAdd: vi.fn(),
      errorRemove: vi.fn(),
      apiError: vi.fn()
    }

    mutations = {
      popupMessagesRemove: vi.fn(),
      loadingAdd: vi.fn(),
      popupClose: vi.fn(),
      popupMessageAdd: vi.fn(),
      loadingRemove: vi.fn(),
      menuClose: vi.fn()
    }

    map = { state: {} }

    store = createStore({
      modules: { user, map },
      actions,
      mutations
    })

    const app = createApp({})
    app.use(store)
  })

  test("initialise les métas de l'utilisateur connecté", async () => {
    const apiMock = api.userMetas.mockResolvedValue([])

    await store.dispatch('user/init')

    expect(apiMock).toHaveBeenCalled()
    expect(store.state.user.metas).toEqual({ entreprisesTitresCreation: [] })
    expect(mutations.loadingRemove).toHaveBeenCalled()
  })

  test("retourne une erreur si l'api ne répond pas", async () => {
    const apiMock = api.userMetas.mockRejectedValue(
      new Error("erreur de l'api")
    )

    await store.dispatch('user/init')

    expect(apiMock).toHaveBeenCalled()
    expect(mutations.loadingRemove).toHaveBeenCalled()
    expect(actions.apiError).toHaveBeenCalled()
  })

  test("identifie l'utilisateur si un token valide est présent", async () => {
    const apiMock = fetchWithJson.mockResolvedValue(userInfo)

    store = createStore({ modules: { user, map }, actions, mutations })

    await store.dispatch('user/identify')

    expect(store.state.user.element).toEqual({
      id: 66,
      prenom: 'rene',
      nom: 'lataupe',
      email: 'rene@la.taupe',
      role: 'admin',
      entreprise: 'macdo'
    })
    expect(apiMock).toHaveBeenCalled()
  })

  test('ajoute un utilisateur', async () => {
    store = createStore({ modules: { user, map }, actions, mutations })
    const apiMock = api.utilisateurCreer.mockResolvedValue(userInfo)
    await store.dispatch('user/add', { utilisateur: userInfo, token: 'token' })

    expect(apiMock).toHaveBeenCalledWith({
      utilisateur: userInfo,
      token: 'token'
    })
    expect(actions.messageAdd).toHaveBeenCalled()
  })

  test("n'ajoute pas d'utilisateur", async () => {
    const apiMock = api.utilisateurCreer.mockResolvedValue(null)
    await store.dispatch('user/add', { utilisateur: userInfo, token: 'token' })

    expect(apiMock).toHaveBeenCalledWith({
      utilisateur: userInfo,
      token: 'token'
    })
    expect(actions.messageAdd).not.toHaveBeenCalled()
  })

  test("retourne une erreur api lors de l'ajout d'un utilisateur", async () => {
    store = createStore({ modules: { user, map }, actions, mutations })
    const apiMock = api.utilisateurCreer.mockRejectedValue(
      new Error("erreur dans l'api")
    )
    await store.dispatch('user/add', { utilisateur: userInfo, token: 'token' })

    expect(apiMock).toHaveBeenCalledWith({
      utilisateur: userInfo,
      token: 'token'
    })
    expect(actions.messageAdd).toHaveBeenCalled()
  })

  test("initialise les preferences de l'utilisateur", async () => {
    const section = 'conditions'
    const value = 'conditionValue'
    const params = { value }
    await store.dispatch('user/preferencesSet', { section, params })

    expect(localStorage.getItem('conditions')).toEqual(value)
  })

  test('initialise les preferences de filtre', async () => {
    const section = 'carte'
    const params = { zoom: 2 }
    await store.dispatch('user/preferencesSet', { section, params })

    expect(store.state.user.preferences.carte.zoom).toEqual(2)
  })

  test("retourne true si l'utilisateur est connecté", () => {
    user.state.element = {}
    store = createStore({ modules: { user } })

    expect(store.getters['user/preferencesConditions']).toBeTruthy()
  })

  test('ne recupere pas les preferences sauvegardées: vieilles de plus de 3 jours', () => {
    localStorage.setItem('conditions', '3')
    expect(store.getters['user/preferencesConditions']).toBeFalsy()
  })

  test('recupere les preferences sauvegardées', () => {
    localStorage.setItem('conditions', new Date().getTime().toString())
    expect(store.getters['user/preferencesConditions']).toBeTruthy()
  })

  test("initialise le statut de l'user sans entreprises", () => {
    store.commit('user/set', {
      id: 66,
      prenom: 'rene',
      nom: 'lataupe',
      role: 'admin'
    })

    expect(store.state.user.element).toEqual({
      id: 66,
      prenom: 'rene',
      nom: 'lataupe',
      role: 'admin'
    })
    expect(store.state.user.element.entreprise).toBeUndefined()
  })

  test.each([
    [{ role: 'super' }, true, undefined],
    [{ role: 'admin', administrationId: 'dea-guadeloupe-01' }, true],
    [{ role: 'editeur', administrationId: 'dea-guadeloupe-01' }, true],
    [{ role: 'entreprise', entreprises: [] }, false],
    [undefined, false]
  ])(
    'ajoute un utilisateur au store avec le role $role et vérifie si il est admin $isAdmin',
    (user, isAdmin) => {
      store.commit('user/set', {
        ...testBlankUser,
        ...user
      })
      expect(store.getters['user/userIsAdmin']).toEqual(isAdmin)
    }
  )
})
