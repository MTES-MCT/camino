import {
  administration,
  administrationMetas,
  administrationTitreTypeTitreStatutUpdate,
  administrationTitreTypeEtapeTypeUpdate,
  administrationActiviteTypeUpdate,
  administrationActiviteTypeEmailUpdate,
  administrationActiviteTypeEmailDelete,
  administrationPermissionsMetas
} from '../api/administrations'

const state = {
  element: null,
  activitesTypesEmails: [],
  metas: {
    domaines: [],
    titresStatuts: [],
    etapesTypes: [],
    activitesTypes: []
  }
}

const actions = {
  async init({ commit }) {
    try {
      commit('loadingAdd', 'administrationInit', { root: true })
      const data = await administrationMetas()
      commit('metasSet', { activitesTypes: data })
    } catch (e) {
      commit('popupMessageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'administrationInit', { root: true })
    }
  },

  async permissionsInit({ commit }) {
    try {
      commit('loadingAdd', 'administrationPermissionsInit', {
        root: true
      })

      const data = await administrationPermissionsMetas()
      commit('metasSet', data)
    } catch (e) {
      commit('messageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'administrationPermissionsInit', {
        root: true
      })
    }
  },

  async get({ commit, dispatch }, id) {
    try {
      commit('loadingAdd', 'administration', { root: true })

      const data = await administration({ id })

      commit('set', data)
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'administration', { root: true })
    }
  },

  async titreTypeTitreStatutUpdate(
    { commit, dispatch },
    administrationTitreTypeTitreStatut
  ) {
    try {
      commit('loadingAdd', 'administrationTitreTypeTitreStatutUpdate', {
        root: true
      })

      const data = await administrationTitreTypeTitreStatutUpdate({
        administrationTitreTypeTitreStatut
      })

      await dispatch(
        'reload',
        { name: 'administration', id: data.id },
        { root: true }
      )
      dispatch(
        'messageAdd',
        { value: `l'administration a été mise à jour`, type: 'success' },
        { root: true }
      )
    } catch (e) {
      commit('messageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'administrationTitreTypeTitreStatutUpdate', {
        root: true
      })
    }
  },

  async titresTypeEtapeTypeUpdate(
    { commit, dispatch },
    administrationTitreTypeEtapeType
  ) {
    try {
      commit('loadingAdd', 'administrationTitreTypeEtapeTypeUpdate', {
        root: true
      })

      const data = await administrationTitreTypeEtapeTypeUpdate({
        administrationTitreTypeEtapeType
      })

      await dispatch(
        'reload',
        { name: 'administration', id: data.id },
        { root: true }
      )
      dispatch(
        'messageAdd',
        { value: `l'administration a été mise à jour`, type: 'success' },
        { root: true }
      )
    } catch (e) {
      commit('messageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'administrationTitreTypeEtapeTypeUpdate', {
        root: true
      })
    }
  },

  async activiteTypeUpdate({ commit, dispatch }, administrationActiviteType) {
    try {
      commit('loadingAdd', 'administrationActiviteTypeUpdate', {
        root: true
      })

      const data = await administrationActiviteTypeUpdate({
        administrationActiviteType
      })

      await dispatch(
        'reload',
        { name: 'administration', id: data.id },
        { root: true }
      )
      dispatch(
        'messageAdd',
        { value: `l'administration a été mise à jour`, type: 'success' },
        { root: true }
      )
    } catch (e) {
      commit('messageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'administrationActiviteTypeUpdate', {
        root: true
      })
    }
  },

  async activiteTypeEmailUpdate(
    { commit, dispatch },
    administrationActiviteTypeEmail
  ) {
    try {
      commit('loadingAdd', 'administrationActiviteTypeEmailUpdate', {
        root: true
      })

      const { id } = await administrationActiviteTypeEmailUpdate({
        administrationActiviteTypeEmail
      })
      await dispatch('reload', { name: 'administration', id }, { root: true })
      dispatch(
        'messageAdd',
        { value: `l'email a été ajouté pour notifications`, type: 'success' },
        { root: true }
      )
    } catch (e) {
      commit('messageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'administrationActiviteTypeEmailUpdate', {
        root: true
      })
    }
  },

  async activiteTypeEmailDelete(
    { commit, dispatch },
    administrationActiviteTypeEmail
  ) {
    try {
      commit('loadingAdd', 'administrationActiviteTypeEmailDelete', {
        root: true
      })

      const { id } = await administrationActiviteTypeEmailDelete({
        administrationActiviteTypeEmail
      })
      await dispatch('reload', { name: 'administration', id }, { root: true })
      dispatch(
        'messageAdd',
        { value: `l'email a été retiré`, type: 'success' },
        { root: true }
      )
    } catch (e) {
      commit('messageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'administrationActiviteTypeEmailDelete', {
        root: true
      })
    }
  }
}

const mutations = {
  metasSet(state, data) {
    Object.keys(data).forEach(id => {
      if (id === 'statuts') {
        state.metas.titresStatuts = data[id]
      } else {
        state.metas[id] = data[id]
      }
    })
  },

  set(state, data) {
    state.element = data.administration
    state.activitesTypesEmails = data.administrationActivitesTypesEmails
  },

  reset(state) {
    state.element = null
    state.activitesTypesEmails = []
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
