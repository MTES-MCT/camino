import { titreDemandeCreer } from '../api/titre-demande'
import router from '../router'
import { titreCreationMetas } from '../api/titres'

const state = {
  metas: {
    referencesTypes: []
  }
}

const actions = {
  async init({ commit, dispatch }) {
    commit('loadingAdd', 'titreCreationInit', { root: true })

    try {
      const data = await titreCreationMetas()

      commit('metasSet', { referencesTypes: data })
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'titreCreationInit', { root: true })
    }
  },

  async save({ commit, dispatch }, titreDemande) {
    try {
      commit('loadingAdd', 'titreCreationAdd', { root: true })

      if (titreDemande.references) {
        titreDemande.references = titreDemande.references.filter(
          reference => reference.nom
        )
      }

      const data = await titreDemandeCreer({ titreDemande })

      await router.push({
        name: 'etape-edition',
        params: { id: data.titreEtapeId }
      })

      dispatch(
        'messageAdd',
        {
          value: 'la demande de titre a été créée',
          type: 'success'
        },
        { root: true }
      )
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'titreCreationAdd', { root: true })
    }
  }
}

const mutations = {
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
  mutations
}
