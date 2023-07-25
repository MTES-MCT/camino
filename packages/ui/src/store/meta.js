import { metasIndex } from './metas-definitions'
import { nextTick } from 'vue'

const state = {
  elementsIndex: {},
  elementsSelectedIndex: {},
}

const idsFind = (element, definition) =>
  definition.ids
    ? definition.ids.reduce((ids, id) => {
        ids[id] = element[id]

        return ids
      }, {})
    : { id: element.id }

const getters = {
  elements: state => id => state.elementsIndex[id],
  elementSelected: state => id => state.elementsSelectedIndex[id],
}

const actions = {
  async get({ dispatch, commit, state }, id) {
    try {
      commit('loadingAdd', 'metaGet', { root: true })

      if (metasIndex[id]) {
        const definition = metasIndex[id]
        const elements = await definition.get()
        commit('set', { id, elements })

        for (const colonne of definition.colonnes) {
          if (colonne.type === 'entities' && colonne.entities && !state.elementsIndex[colonne.entities]) {
            const entities = await metasIndex[colonne.entities].get()

            commit('set', { id: colonne.entities, elements: entities })
          }
        }
      }
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'metaGet', { root: true })
    }
  },

  elementSelect({ commit }, { id, element }) {
    commit('elementSelectedSet', { id, element: null })
    if (element) {
      nextTick(() => {
        commit('elementSelectedSet', { id, element })
      })
    }
  },
}

const mutations = {
  reset(state) {
    state.elementsIndex = {}
    state.elementsSelectedIndex = {}
  },

  set(state, { id, elements }) {
    state.elementsIndex = { ...state.elementsIndex, [id]: elements }
  },

  elementSelectedSet(state, { id, element }) {
    state.elementsSelectedIndex = {
      ...state.elementsSelectedIndex,
      [id]: element,
    }
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
}
