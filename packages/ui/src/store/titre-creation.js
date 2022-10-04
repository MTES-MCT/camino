import { titreDemandeCreer } from '../api/titre-demande'
import router from '../router'

const actions = {
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

export default {
  namespaced: true,
  actions
}
