import { canReadActivites } from 'camino-common/src/permissions/activites'
import { titre, titreCreer } from '../api/titres'

import router from '../router'
import { canCreateTravaux } from 'camino-common/src/permissions/titres-demarches'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { getDownloadRestRoute } from '@/api/client-rest'

const state = {
  element: null,
  opened: {
    etapes: {},
    activites: {},
    travaux: {},
  },
  tabId: 'demarches',
}

const getters = {
  tabId(state, getters) {
    const tabIds = getters.tabs.map(({ id }) => id)

    if (!tabIds.includes(state.tabId)) {
      return tabIds[0]
    }

    return state.tabId
  },

  tabs(state, getters, rootState, rootGetters) {
    const tabs = [{ id: 'demarches', nom: 'Droits miniers' }]

    if (state.element) {
      if (canReadActivites(rootState.user.element)) {
        tabs.push({ id: 'activites', nom: 'Activités' })
      }

      if (getters.travaux.length || canCreateTravaux(rootState.user.element, state.element.typeId, state.element.administrations)) {
        tabs.push({ id: 'travaux', nom: 'Travaux' })
      }
    }

    if (rootGetters['user/userIsSuper']) {
      tabs.push({ id: 'journaux', nom: 'Journaux' })
    }

    return tabs
  },

  demarches(state) {
    return state.element?.demarches?.filter(d => !DemarchesTypes[d.typeId].travaux) || []
  },

  travaux(state) {
    return state.element?.demarches?.filter(d => DemarchesTypes[d.typeId].travaux) || []
  },
}

const actions = {
  async get({ commit, dispatch }, id) {
    try {
      commit('loadingAdd', 'titre', { root: true })

      const data = await titre({ id })

      if (data) {
        commit('set', data)
        // remplace l’id de l’url par le slug
        history.replaceState({}, null, data.slug)
      } else {
        dispatch('pageError', null, { root: true })
      }
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'titre', { root: true })
    }
  },

  async add({ commit, dispatch }, titre) {
    try {
      commit('popupMessagesRemove', null, { root: true })
      commit('popupLoad', null, { root: true })
      commit('loadingAdd', 'titreAdd', { root: true })

      const data = await titreCreer({ titre })

      commit('popupClose', null, { root: true })
      router.push({ name: 'titre', params: { id: data.slug } })
      dispatch(
        'messageAdd',
        {
          value: 'le titre a été créé',
          type: 'success',
        },
        { root: true }
      )
    } catch (e) {
      commit('popupMessageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'titreAdd', { root: true })
    }
  },
}

const mutations = {
  set(state, titre) {
    state.element = titre
  },

  reset(state) {
    state.element = null
  },

  open(state, { section, id }) {
    if (!state.opened[section][id]) {
      state.opened[section][id] = true
    }

    state.tabId = section
  },

  close(state, { section, id }) {
    if (state.opened[section][id]) {
      state.opened[section][id] = false
    }
  },

  toggle(state, { section, id }) {
    state.opened[section][id] = !state.opened[section][id]
  },

  openTab(state, tabId) {
    state.tabId = tabId
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
}
