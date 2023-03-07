// import {
//   utilisateurMetas,
// } from '../api/utilisateurs'

import router from '../router'

const state = {
  element: null,
  metas: {
    entreprises: []
  },
  metasLoaded: false
}

const actions = {
  // async init({ commit }) {
  //   commit('loadingAdd', 'utilisateurInit', { root: true })
  //   try {
  //     const data = await utilisateurMetas()
  //     commit('metasSet', data)
  //   } catch (e) {
  //     commit('popupMessageAdd', { value: e, type: 'error' }, { root: true })
  //   } finally {
  //     commit('loadingRemove', 'utilisateurInit', { root: true })
  //   }
  // },
  // async add({ commit, dispatch }, utilisateur) {
  //   commit('popupMessagesRemove', null, { root: true })
  //   commit('popupLoad', null, { root: true })
  //   commit('loadingAdd', 'utilisateurAdd', { root: true })
  //   try {
  //     const data = await utilisateurCreer({ utilisateur })
  //     commit('popupClose', null, { root: true })
  //     dispatch(
  //       'messageAdd',
  //       {
  //         value: `l'utilisateur ${data.prenom} ${data.nom} a été ajouté`,
  //         type: 'success'
  //       },
  //       { root: true }
  //     )
  //     return data
  //   } catch (e) {
  //     commit('popupMessageAdd', { value: e, type: 'error' }, { root: true })
  //   } finally {
  //     commit('loadingRemove', 'utilisateurAdd', { root: true })
  //   }
  // },
  // async update({ commit, dispatch, rootState }, utilisateur) {
  //   commit('popupMessagesRemove', null, { root: true })
  //   commit('popupLoad', null, { root: true })
  //   commit('loadingAdd', 'utilisateurUpdate', { root: true })
  //   try {
  //     const data = await utilisateurModifier({ utilisateur })
  //     commit('popupClose', null, { root: true })
  //     if (utilisateur.id === rootState.user.element.id) {
  //       commit('user/set', data, { root: true })
  //     }
  //     await dispatch(
  //       'reload',
  //       { name: 'utilisateur', id: data.id },
  //       { root: true }
  //     )
  //     dispatch(
  //       'messageAdd',
  //       { value: `l'utilisateur a été mis à jour`, type: 'success' },
  //       { root: true }
  //     )
  //   } catch (e) {
  //     commit('popupMessageAdd', { value: e, type: 'error' }, { root: true })
  //   } finally {
  //     commit('loadingRemove', 'utilisateurUpdate', { root: true })
  //   }
  // }
}

const mutations = {
  set(state, utilisateur) {
    state.element = utilisateur
  },

  reset(state) {
    state.element = null
  },

  metasReset(state) {
    state.metas = {
      entreprises: []
    }
    state.metasLoaded = false
  },

  metasSet(state, data) {
    state.metas.entreprises = data.elements

    state.metasLoaded = true
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
