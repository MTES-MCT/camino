import { shallowRef } from 'vue'
import { createStore } from 'vuex'
import { saveAs } from 'file-saver'

import router from '../router'
import { urlQueryUpdate } from '../utils/url'

import titre from './titre'
import titreCreation from './titre-creation'
import titreEtape from './titre-etape'
import titreEtapeEdition from './titre-etape-edition'
import document from './document'
import titresDemarches from './titres-demarches'
import metas from './metas'
import meta from './meta'
import user from './user'
import titreActivite from './titre-activite'
import titreActiviteEdition from './titre-activite-edition'

const modules = {
  titre,
  titreCreation,
  titreEtape,
  titreEtapeEdition,
  document,
  titresDemarches,
  meta,
  metas,
  user,
  titreActivite,
  titreActiviteEdition,
}

const state = {
  config: {},
  messages: [],
  popup: { component: null, props: null, messages: [], loading: false },
  error: null,
  menu: { component: null },
  loading: [],
  fileLoading: {
    loaded: 0,
    total: 0,
  },
}

function isOnPristineLandingPage(query) {
  return query.centre === '46.227103425310766,2.499999999999991' && query.vueId === 'carte' && Object.keys(query).length === 3
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

  pageError({ commit, getters }) {
    if (getters['user/user'] !== null) {
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

  async reload({ dispatch, rootState }, { name, id }) {
    if (!id) {
      router.push({ name })
    } else {
      const idOld = rootState.route.params.id

      if (id !== idOld) {
        router.replace({ name, params: { id } })
      } else {
        await dispatch(`${name}/get`, id)
      }
    }
  },

  async downloadDocument({ dispatch }, document) {
    if (document.fichierNouveau) {
      saveAs(document.fichierNouveau)
      dispatch('messageAdd', {
        type: 'success',
        value: `fichier téléchargé : ${document.fichierNouveau.name}`,
      })
    } else {
      await dispatch('download', `/download/fichiers/${document.id}`)
    }
  },

  async download({ dispatch, commit }, path) {
    try {
      saveAs(`/apiUrl${path}`)

      dispatch('messageAdd', {
        type: 'success',
        value: `fichier téléchargé`,
      })
    } catch (e) {
      dispatch('apiError', `téléchargement : ${path}, ${e}`)
    } finally {
      commit('loadingRemove', 'fileLoading')
      commit('fileLoad', { loaded: 0, total: 0 })
    }
  },

  async urlQueryUpdate({ rootState }, { params, definitions }) {
    const { status, query } = urlQueryUpdate(params, rootState.route.query, definitions)

    if (status === 'updated') {
      await router.push({ query })
    } else if (status === 'created') {
      await router.replace({ query })
    }

    if (isOnPristineLandingPage(query)) {
      history.replaceState({}, null, '/')
    }
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

  popupOpen(state, { component, props }) {
    state.popup.component = shallowRef(component)
    state.popup.props = props
    state.popup.messages = []
  },

  popupClose(state) {
    state.popup.component = null
    state.popup.props = null
    state.popup.messages = []
    state.popup.loading = false
  },

  errorUpdate(state, error) {
    state.error = error
  },

  popupLoad(state) {
    state.popup.loading = true
  },

  popupMessagesRemove(state) {
    state.popup.messages = []
    state.popup.loading = false
  },

  popupMessageAdd(state, message) {
    state.popup.messages.push(message)
    state.popup.loading = false
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

export { state, actions, mutations }

export default createStore({
  state,
  actions,
  mutations,
  modules,
})
