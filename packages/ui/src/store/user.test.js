import { createStore } from 'vuex'
import { createApp } from 'vue'
import { getWithJson } from '../api/client-rest'
import user from './user'

import { vi, describe, test, beforeEach, expect } from 'vitest'
import { testBlankUser } from 'camino-common/src/tests-utils'

vi.mock('../api/utilisateurs', () => ({
  utilisateurCreer: vi.fn(),
}))

vi.mock('../api/client-rest', () => ({
  getWithJson: vi.fn(),
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
      email: 'rene@la.taupe',
    }

    user.state = {
      element: null,
      preferences: {
        carte: {},
      },
    }

    actions = {
      messageAdd: vi.fn(),
      errorRemove: vi.fn(),
      apiError: vi.fn(),
    }

    mutations = {
      popupMessagesRemove: vi.fn(),
      loadingAdd: vi.fn(),
      popupClose: vi.fn(),
      popupMessageAdd: vi.fn(),
      loadingRemove: vi.fn(),
      menuClose: vi.fn(),
    }

    map = { state: {} }

    store = createStore({
      modules: { user, map },
      actions,
      mutations,
    })

    const app = createApp({})
    app.use(store)
  })

  test("identifie l'utilisateur si un token valide est présent", async () => {
    const apiMock = getWithJson.mockResolvedValue(userInfo)

    store = createStore({ modules: { user, map }, actions, mutations })

    await store.dispatch('user/identify')

    expect(store.state.user.element).toEqual({
      id: 66,
      prenom: 'rene',
      nom: 'lataupe',
      email: 'rene@la.taupe',
      role: 'admin',
      entreprise: 'macdo',
    })
    expect(apiMock).toHaveBeenCalled()
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
      role: 'admin',
    })

    expect(store.state.user.element).toEqual({
      id: 66,
      prenom: 'rene',
      nom: 'lataupe',
      role: 'admin',
    })
    expect(store.state.user.element.entreprise).toBe(undefined)
  })

  test.each([
    [{ role: 'super' }, true, undefined],
    [{ role: 'admin', administrationId: 'dea-guadeloupe-01' }, true],
    [{ role: 'editeur', administrationId: 'dea-guadeloupe-01' }, true],
    [{ role: 'entreprise', entreprises: [] }, false],
    [undefined, false],
  ])('ajoute un utilisateur au store avec le role $role et vérifie si il est admin $isAdmin', (user, isAdmin) => {
    store.commit('user/set', {
      ...testBlankUser,
      ...user,
    })
    expect(store.getters['user/userIsAdmin']).toEqual(isAdmin)
  })
})
