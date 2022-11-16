import { statistiquesGranulatsMarins } from '../api/statistiques'

const state = {
  granulatsMarins: {}
}

const actions = {
  async get({ commit, dispatch }, section) {
    try {
      commit('loadingAdd', 'statistiquesGet', { root: true })

      let data
      if (section === 'granulatsMarins') {
        data = await statistiquesGranulatsMarins()
      }

      commit('set', { section, data })
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'statistiquesGet', { root: true })
    }
  }
}

const mutations = {
  set(state, { section, data }) {
    state[section] = data
  }
}

export default { namespaced: true, state, actions, mutations }
