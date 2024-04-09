import { etapeEditFormat } from '../utils/titre-etape-edit'
import { etapeSaveFormat } from '../utils/titre-etape-save'
import { etapeHeritageBuild } from '../utils/titre-etape-heritage-build'

import { etape, etapeCreer, etapeHeritage, etapeModifier } from '../api/titres-etapes'

const state = {
  element: null,
  metas: {
    demarche: null,
    entreprises: [],
  },
  heritageLoaded: false,
  loaded: false,
}

const actions = {
  async init({ commit, state, dispatch }, { titreDemarcheId, id, entreprises }) {
    try {
      commit('loadingAdd', 'titreEtapeInit', { root: true })

      if (id) {
        const newEtape = await etape({ id })

        commit('set', etapeEditFormat(newEtape))

        commit('heritageLoaded', true)

        titreDemarcheId = state.element.titreDemarcheId
      } else {
        commit('set', etapeEditFormat({ titreDemarcheId }))
      }

      await dispatch('metasGet', { titreDemarcheId, entreprises })

      commit('load')
    } catch (e) {
      console.error(e)
      dispatch('pageError', null, { root: true })
    } finally {
      commit('loadingRemove', 'titreEtapeInit', { root: true })
    }
  },

  async heritageGet({ commit, state, dispatch }, { etapeTypeId }) {
    try {
      commit('loadingAdd', 'titreEtapeHeritageGet', { root: true })
      commit('heritageLoaded', false)

      const data = await etapeHeritage({
        titreDemarcheId: state.metas.demarche.id,
        date: state.element.date,
        typeId: etapeTypeId,
      })

      const apiEtape = etapeEditFormat(data)
      const newEtape = etapeHeritageBuild(state.element.date, state.metas.demarche.id, apiEtape)

      commit('heritageSet', { etape: newEtape })

      commit('heritageLoaded', true)
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'titreEtapeHeritageGet', {
        root: true,
      })
    }
  },

  async upsert({ state, commit, dispatch }, { etape }) {
    try {
      commit('loadingAdd', 'titreEtapeUpdate', { root: true })

      const etapeEditFormatted = etapeSaveFormat(etape)
      etapeEditFormatted.titreDemarcheId = state.metas.demarche.id
      let data
      if (etapeEditFormatted.id) {
        data = await etapeModifier({ etape: etapeEditFormatted })
      } else {
        data = await etapeCreer({ etape: etapeEditFormatted })
      }

      return data.id
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'titreEtapeUpdate', { root: true })
    }
  },
}

export default {
  namespaced: true,
  state,
  actions,
}
