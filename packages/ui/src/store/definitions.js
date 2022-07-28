import {
  demarchesStatuts,
  demarchesTypes,
  etapesTypes,
  substancesLegales,
  titresStatuts
} from '../api/metas'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { Domaines } from 'camino-common/src/static/domaines'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'

const definitionsIndex = {
  domaines: () => Object.values(Domaines),
  'titre-minier': '',
  'autorisation-miniere': '',
  'demarches-statuts': demarchesStatuts,
  'demarches-types': demarchesTypes,
  'etapes-types': etapesTypes,
  'etapes-statuts': () => Object.values(EtapesStatuts),
  'substances-legales': substancesLegales,
  'titres-statuts': titresStatuts,
  'titres-types': () => Object.values(TitresTypesTypes)
}

const state = {
  elements: [],
  entrees: []
}

const actions = {
  async entreesGet({ state, dispatch, commit }, slug) {
    commit('loadingAdd', 'definition', { root: true })

    try {
      if (definitionsIndex[slug]) {
        const data = await definitionsIndex[slug]()
        commit('entreesSet', data)
      } else {
        commit('entreesSet', [])
      }
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'definition', { root: true })
    }
  }
}

const mutations = {
  set(state, data) {
    state.elements = data
  },

  entreesSet(state, data) {
    state.entrees = data
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
