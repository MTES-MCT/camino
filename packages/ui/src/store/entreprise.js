import { entreprise } from '../api/entreprises'

import router from '../router'

const state = {
  element: null,
  metas: {
    domaines: [],
  },
}

const actions = {
  async get({ commit, dispatch }, id) {
    try {
      commit('loadingAdd', 'entrepriseGet', { root: true })

      const data = await entreprise({ id })

      if (data) {
        commit('set', data)
      } else {
        dispatch('pageError', null, { root: true })
      }
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'entrepriseGet', { root: true })
    }
  },
}

const mutations = {
  metasSet(state, data) {
    Object.keys(data).forEach(id => {
      state.metas[id] = data[id]
    })
  },

  set(state, entreprise) {
    state.element = entreprise
  },

  reset(state) {
    state.element = null
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
