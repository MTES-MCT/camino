import { etapeDeposer } from '../api/titres-etapes'

const stateInitial = {
  element: null,
}

const state = JSON.parse(JSON.stringify(stateInitial))

const actions = {
  async depose({ commit, dispatch }, etapeId) {
    try {
      commit('popupMessagesRemove', null, { root: true })
      commit('popupLoad', null, { root: true })
      commit('loadingAdd', 'titreEtapeDepose', { root: true })

      await etapeDeposer({ id: etapeId })

      commit('popupClose', null, { root: true })
      dispatch('messageAdd', { value: `la demande a été déposée`, type: 'success' }, { root: true })
    } catch (e) {
      commit('popupMessageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'titreEtapeDepose', { root: true })
    }
  },
}

const mutations = {
  set(state, { etape }) {
    state.element = etape
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
