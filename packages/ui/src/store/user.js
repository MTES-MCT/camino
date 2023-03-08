import { ADMINISTRATION_IDS, ADMINISTRATION_TYPES, Administrations } from 'camino-common/src/static/administrations'
import { isAdministrationAdmin, isAdministrationEditeur, isSuper } from 'camino-common/src/roles'
import { fetchWithJson } from '@/api/client-rest'
import { CaminoRestRoutes } from 'camino-common/src/rest'

const state = {
  element: null,
  preferences: {
    carte: { markerLayersId: 'clusters' },
  },
  loaded: false,
}

const actions = {
  async identify({ commit }) {
    try {
      commit('loadingAdd', 'userMoi', { root: true })

      const data = await fetchWithJson(CaminoRestRoutes.moi, {})

      commit('set', data)
    } catch (e) {
      commit('reset')
    } finally {
      commit('loadingRemove', 'userMoi', { root: true })
      commit('load')
    }
  },

  preferencesSet({ commit }, { section, params }) {
    if (section === 'conditions') {
      localStorage.setItem('conditions', params.value)
    } else {
      commit('preferencesSet', { section, params })
    }
  },
}

const getters = {
  user(state) {
    return state.element
  },
  hasEntreprises(state) {
    return state?.element?.entreprises?.length > 0
  },
  isLoaded(state) {
    return state.loaded
  },

  preferencesConditions(state) {
    if (state.element) {
      return true
    }

    const threedays = 1000 * 60 * 60

    if (localStorage.getItem('conditions') && Number(localStorage.getItem('conditions')) + threedays > new Date().getTime()) {
      return true
    }

    return false
  },
  /*
  / @deprecated
  */
  userIsAdmin(state) {
    return isSuper(state.element) || isAdministrationAdmin(state.element) || isAdministrationEditeur(state.element)
  },

  isONF(state) {
    return (isAdministrationAdmin(state.element) || isAdministrationEditeur(state.element)) && state.element.administrationId === ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
  },
  isPTMG(state) {
    return (isAdministrationAdmin(state.element) || isAdministrationEditeur(state.element)) && state.element.administrationId === ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
  },
  isDREAL(state) {
    return (
      (isAdministrationAdmin(state.element) || isAdministrationEditeur(state.element)) &&
      [ADMINISTRATION_TYPES.dea.id, ADMINISTRATION_TYPES.dre.id].includes(Administrations[state.element.administrationId].typeId)
    )
  },
  isDGTM(state) {
    return (isAdministrationAdmin(state.element) || isAdministrationEditeur(state.element)) && state.element.administrationId === ADMINISTRATION_IDS['DGTM - GUYANE']
  },

  userIsSuper(state) {
    return isSuper(state.element)
  },
}

const mutations = {
  load(state) {
    state.loaded = true
  },

  preferencesSet(state, { section, params }) {
    Object.keys(params).forEach(id => {
      state.preferences[section][id] = params[id]
    })
  },

  set(state, user) {
    state.element = user
  },

  reset(state) {
    state.element = null
  },
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
}
