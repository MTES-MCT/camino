import { etapeEditFormat } from '../utils/titre-etape-edit'
import { etapeSaveFormat } from '../utils/titre-etape-save'
import { etapeHeritageBuild } from '../utils/titre-etape-heritage-build'

import { etape, etapeCreer, etapeHeritage, etapeModifier, titreEtapeMetas } from '../api/titres-etapes'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'

const state = {
  element: null,
  metas: {
    demarche: null,
    entreprises: [],
  },
  heritageLoaded: false,
  loaded: false,
}

const getters = {
  etapeType(state) {
    if (state.element?.typeId) {
      return EtapesTypes[state.element.typeId]
    }
    return null
  },
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

      if (id) {
        await dispatch('dateUpdate', { date: state.element.date })
      }

      commit('load')
    } catch (e) {
      console.error(e)
      dispatch('pageError', null, { root: true })
    } finally {
      commit('loadingRemove', 'titreEtapeInit', { root: true })
    }
  },

  async metasGet({ commit, dispatch }, { titreDemarcheId, entreprises }) {
    try {
      commit('loadingAdd', 'titreEtapeMetasGet', { root: true })

      const demarche = await titreEtapeMetas({
        titreDemarcheId,
      })

      commit('metasSet', { demarche, entreprises })
    } catch (e) {
      console.error(e)

      dispatch('pageError', null, { root: true })
    } finally {
      commit('loadingRemove', 'titreEtapeMetasGet', { root: true })
    }
  },

  async dateUpdate({ commit }, { date }) {
    commit('dateSet', date)
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

const mutations = {
  load(state) {
    state.loaded = true
  },

  set(state, etape) {
    state.element = etape
  },

  dateSet(state, date) {
    state.element.date = date
  },

  reset(state) {
    state.element = null
    state.metas = {
      demarche: null,
      entreprises: [],
    }
    state.heritageLoaded = false
    state.loaded = false
  },

  heritageSet(state, { etape }) {
    state.element = etape
  },

  heritageLoaded(state, loaded) {
    state.heritageLoaded = loaded
  },

  metasSet(state, data) {
    Object.keys(data).forEach(id => {
      state.metas[id] = data[id]
    })
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
