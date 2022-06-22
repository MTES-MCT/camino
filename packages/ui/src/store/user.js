import {
  moi,
  utilisateurCerbereTokenCreer,
  utilisateurCerbereUrlObtenir,
  utilisateurCreer,
  userMetas,
  newsletterInscrire
} from '../api/utilisateurs'

import tiles from '../utils/map-tiles'

import router from '../router'
import {
  ADMINISTRATION_IDS,
  ADMINISTRATION_TYPES,
  Administrations
} from 'camino-common/src/administrations'
import {
  isAdministration,
  isAdministrationAdmin,
  isAdministrationEditeur,
  isSuper
} from 'camino-common/src/roles'

const state = {
  element: null,
  metas: {
    domaines: [],
    tiles,
    entreprisesTitresCreation: []
  },
  preferences: {
    carte: { tilesId: 'osm-fr', markerLayersId: 'clusters' }
  },
  loaded: false
}

const actions = {
  async init({ commit, dispatch }) {
    try {
      commit('loadingAdd', 'userInit', { root: true })

      const data = await userMetas({ titresCreation: true })

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

  async cerbereUrlGet({ commit }, url) {
    try {
      commit('popupMessagesRemove', null, { root: true })
      commit('loadingAdd', 'cerbereUrlGet', { root: true })

      const data = await utilisateurCerbereUrlObtenir({ url })

      return data
    } catch (e) {
      commit('popupMessageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'cerbereUrlGet', { root: true })
    }
  },

  async cerbereLogin({ commit, dispatch }, { ticket }) {
    try {
      commit('loadingAdd', 'userCerbereLogin', { root: true })

      const utilisateur = await utilisateurCerbereTokenCreer({ ticket })

      commit('set', utilisateur)
      dispatch(
        'messageAdd',
        {
          value: `bienvenue ${utilisateur.prenom} ${utilisateur.nom}`,
          type: 'success'
        },
        { root: true }
      )

      await dispatch('init')
      dispatch('errorRemove', null, { root: true })
    } catch (e) {
      commit('reset')
    } finally {
      commit('loadingRemove', 'userCerbereLogin', { root: true })
      commit('load')
    }
  },

  async add({ commit, dispatch }, { utilisateur, token }) {
    try {
      commit('loadingAdd', 'userAdd', { root: true })

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

        await dispatch('login', {
          email: data.email,
          motDePasse: utilisateur.motDePasse
        })

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
  },

  async newsletterSubscribe({ commit, dispatch }, email) {
    try {
      commit('loadingAdd', 'newsletterSubscribe', { root: true })

      const message = await newsletterInscrire({
        email
      })

      dispatch('messageAdd', { value: message, type: 'info' }, { root: true })
    } catch (e) {
      dispatch('messageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'newsletterSubscribe', { root: true })
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
  tilesActive(state) {
    return state.metas.tiles.find(
      ({ id }) => id === state.preferences.carte.tilesId
    )
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
    state.metas.domaines = []
  },

  metasSet(state, data) {
    Object.keys(data).forEach(id => {
      state.metas[id] = data[id]
    })
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
