import { createStore } from 'vuex'
import titreEtapeEdition from './titre-etape-edition'
import meta from './meta'

const modules = {
  titreEtapeEdition,
  meta,
}

const state = {
  config: {},
  messages: [],
  error: null,
  menu: { component: null },
  loading: [],
  fileLoading: {
    loaded: 0,
    total: 0,
  },
}

const actions = {
  apiError({ commit }, error) {
    if (error.message === 'aborted') return

    const id = Date.now()

    commit('messageAdd', {
      id,
      type: 'error',
      value: `Erreur : ${error}`,
    })

    setTimeout(() => {
      commit('messageRemove', id)
    }, 4500)

    console.error(error)
  },

  pageError({ user, commit, getters }) {
    if (user !== null) {
      commit('errorUpdate', {
        type: 'error',
        value: `Erreur: page introuvable`,
      })
    } else {
      commit('errorUpdate', {
        type: 'info',
        value: `Vous n'avez pas accès à cette page, veuillez vous connecter.`,
      })
    }
  },

  errorRemove({ state, commit }) {
    if (state.error) {
      commit('errorUpdate', null)
    }
  },

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

  errorUpdate(state, error) {
    state.error = error
  },

  loadingAdd(state, name) {
    state.loading.push(name)
  },

  loadingRemove(state, name) {
    const index = state.loading.indexOf(name)

    if (index > -1) {
      state.loading.splice(index, 1)
    }
  },

  fileLoad(state, { loaded, total }) {
    state.fileLoading.loaded = loaded
    state.fileLoading.total = total
  },
}

export { actions, mutations }

export default createStore({
  state,
  actions,
  mutations,
  modules,
})
