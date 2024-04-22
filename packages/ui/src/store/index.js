import { createStore } from 'vuex'
import meta from './meta'

const modules = {
  meta,
}

const state = {
  messages: [],
}

const actions = {
  messageAdd({ commit }, message) {
    const id = Date.now()
    message.id = id

    commit('messageAdd', message)

    setTimeout(() => {
      commit('messageRemove', id)
    }, 4500)
  },
}

const mutations = {
  messageAdd(state, message) {
    state.messages.push(message)
  },

  messageRemove(state, id) {
    const index = state.messages.findIndex(m => m.id === id)
    state.messages.splice(index, 1)
  },
}

export { actions, mutations }

export default createStore({
  state,
  actions,
  mutations,
  modules,
})
