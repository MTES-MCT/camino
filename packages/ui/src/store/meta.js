/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { metasIndex } from './metas-definitions'
import { nextTick } from 'vue'

const state = {
  elementsIndex: {},
  elementsSelectedIndex: {},
}

const getters = {
  elements: state => id => state.elementsIndex[id],
  elementSelected: state => id => state.elementsSelectedIndex[id],
}

const actions = {
  async get({ _dispatch, commit, state }, id) {
    try {
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
      console.error(e)
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
