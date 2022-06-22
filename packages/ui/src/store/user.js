import { moi, utilisateurCreer, userMetas } from '../api/utilisateurs'

import router from '../router'
import {
  ADMINISTRATION_IDS,
  ADMINISTRATION_TYPES,
  Administrations
} from 'camino-common/src/static/administrations'
import {
  isAdministrationAdmin,
  isAdministrationEditeur,
  isSuper
} from 'camino-common/src/roles'

const state = {
  element: null,
  metas: {
    entreprisesTitresCreation: []
  },
  preferences: {
    carte: { markerLayersId: 'clusters' }
  },
  loaded: false
}

const actions = {
  async init({ commit, dispatch }) {
    try {
      commit('loadingAdd', 'userInit', { root: true })

      const data = await userMetas()

      commit('metasSet', data)
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'userInit', { root: true })
    }
  },

  async identify({ commit, dispatch }) {
    try {
      commit('loadingAdd', 'userMoi', { root: true })
      const data = await moi()

      commit('set', data)

      await dispatch('init')
    } catch (e) {
      commit('reset')
    } finally {
      commit('loadingRemove', 'userMoi', { root: true })
      commit('load')
    }
  },

  async add({ commit, dispatch }, { utilisateur, token }) {
    try {
      commit('loadingAdd', 'userAdd', { root: true })
      const newsletter = utilisateur.newsletter ?? false
      delete utilisateur.newsletter
      const data = await utilisateurCreer({ utilisateur, token })

      if (data) {
        dispatch(
          'messageAdd',
          {
            value: `utilisateur ${data.prenom} ${data.nom} ajouté`,
            type: 'success'
          },
          { root: true }
        )

        if (newsletter) {
          await fetch(`/apiUrl/utilisateurs/${data.id}/newsletter`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ newsletter: true })
          })
        }

        router.push({ name: 'titres' })
      }
    } catch (e) {
      dispatch('messageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'userAdd', { root: true })
    }
  },

  preferencesSet({ commit }, { section, params }) {
    if (section === 'conditions') {
      localStorage.setItem('conditions', params.value)
    } else {
      commit('preferencesSet', { section, params })
    }
  }
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

    if (
      localStorage.getItem('conditions') &&
      Number(localStorage.getItem('conditions')) + threedays >
        new Date().getTime()
    ) {
      return true
    }

    return false
  },
  /*
  / @deprecated
  */
  userIsAdmin(state) {
    return (
      isSuper(state.element) ||
      isAdministrationAdmin(state.element) ||
      isAdministrationEditeur(state.element)
    )
  },

  isONF(state) {
    return (
      (isAdministrationAdmin(state.element) ||
        isAdministrationEditeur(state.element)) &&
      state.element.administrationId ===
        ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    )
  },
  isPTMG(state) {
    return (
      (isAdministrationAdmin(state.element) ||
        isAdministrationEditeur(state.element)) &&
      state.element.administrationId ===
        ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
    )
  },
  isDREAL(state) {
    return (
      (isAdministrationAdmin(state.element) ||
        isAdministrationEditeur(state.element)) &&
      [ADMINISTRATION_TYPES.dea.id, ADMINISTRATION_TYPES.dre.id].includes(
        Administrations[state.element.administrationId].typeId
      )
    )
  },
  isDGTM(state) {
    return (
      (isAdministrationAdmin(state.element) ||
        isAdministrationEditeur(state.element)) &&
      state.element.administrationId === ADMINISTRATION_IDS['DGTM - GUYANE']
    )
  },

  userIsSuper(state) {
    return isSuper(state.element)
  }
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
    state.metas.entreprisesTitresCreation = []
  },

  metasSet(state, data) {
    state.metas.entreprisesTitresCreation = data
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
