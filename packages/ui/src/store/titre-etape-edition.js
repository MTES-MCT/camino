import { documentEtapeFormat, etapeEditFormat } from '../utils/titre-etape-edit'
import { etapeSaveFormat } from '../utils/titre-etape-save'
import { etapeHeritageBuild } from '../utils/titre-etape-heritage-build'

import { etape, etapeCreer, etapeHeritage, etapeModifier, titreEtapeMetas } from '../api/titres-etapes'
import { documentsRequiredAdd } from '../utils/documents'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'

const state = {
  element: null,
  metas: {
    demarche: null,
    entreprises: [],
    documentsTypes: [],
    sdomZonesDocumentTypeIds: [],
    alertes: [],
  },
  heritageLoaded: false,
  loaded: false,
}

const getters = {
  etapeType(state) {
    if (state.element?.type) {
      return EtapesTypes[state.element.type.id]
    }
    return null
  },

  documentsTypes(state) {
    if (!state.element.type || !state.element.type.documentsTypes) {
      return []
    }

    // TODO 2023-06-14 faire une méthode qui récupère les types de documents en fonction de TDE, arm mécanisé et des zones du SDOM
    // state.metas.sdomZonesDocumentTypeIds et state.element.type.documentsTypes ne doivent plus être utilisés
    const documentsTypes = JSON.parse(JSON.stringify(state.element.type.documentsTypes))

    // si la démarche est mécanisée il faut ajouter des documents obligatoires
    if (state.element.contenu && state.element.contenu.arm) {
      documentsTypes.filter(dt => ['doe', 'dep'].includes(dt.id)).forEach(dt => (dt.optionnel = !state.element.contenu.arm.mecanise))
    }

    if (state.metas.sdomZonesDocumentTypeIds?.length) {
      documentsTypes.filter(dt => state.metas.sdomZonesDocumentTypeIds.includes(dt.id)).forEach(dt => (dt.optionnel = false))
    }

    return documentsTypes
  },
}

const actions = {
  async init({ commit, state, dispatch }, { titreDemarcheId, id }) {
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

      await dispatch('metasGet', { titreDemarcheId, id })

      if (id) {
        await dispatch('dateUpdate', { date: state.element.date })

        const { documentTypeIds, alertes } = await titreEtapePerimetreInformations({
          titreEtapeId: id,
        })

        commit('metasSet', {
          sdomZonesDocumentTypeIds: documentTypeIds,
          alertes,
        })

        await dispatch('documentInit', state.element.documents)
      }

      commit('load')
    } catch (e) {
      dispatch('pageError', null, { root: true })
    } finally {
      commit('loadingRemove', 'titreEtapeInit', { root: true })
    }
  },

  async metasGet({ commit, dispatch }, { titreDemarcheId, id }) {
    try {
      commit('loadingAdd', 'titreEtapeMetasGet', { root: true })

      const metas = await titreEtapeMetas({
        titreDemarcheId,
        id,
      })

      commit('metasSet', metas)
    } catch (e) {
      dispatch('pageError', null, { root: true })
    } finally {
      commit('loadingRemove', 'titreEtapeMetasGet', { root: true })
    }
  },

  async dateUpdate({ commit }, { date }) {
    commit('dateSet', date)
  },

  async heritageGet({ commit, state, dispatch }, { titreTypeId, demarcheTypeId, etapeTypeId }) {
    try {
      commit('loadingAdd', 'titreEtapeHeritageGet', { root: true })
      commit('heritageLoaded', false)

      const data = await etapeHeritage({
        titreDemarcheId: state.metas.demarche.id,
        date: state.element.date,
        typeId: etapeTypeId,
      })

      const apiEtape = etapeEditFormat(data)
      const newEtape = etapeHeritageBuild(state.element, apiEtape, titreTypeId, demarcheTypeId, etapeTypeId)

      commit('heritageSet', { etape: newEtape })
      await dispatch('documentInit', state.element.documents)

      //FIXME maintenant c’est getPerimetreAlertes
      const alertes = []
      // const { alertes } = await perimetreInformations({
      //   demarcheId: state.metas.demarche.id,
      //   etapeTypeId,
      // })
      commit('metasSet', {
        alertes,
      })

      commit('heritageLoaded', true)
    } catch (e) {
      dispatch('apiError', e, { root: true })
    } finally {
      commit('loadingRemove', 'titreEtapeHeritageGet', {
        root: true,
      })
    }
  },

  async documentInit({ state, getters, commit, rootGetters }, documents) {
    if (!state.element.type) {
      commit('documentsSet', [])
    } else {
      documents = documentsRequiredAdd(documents, getters.documentsTypes, rootGetters['user/userIsAdmin'])

      commit('documentsSet', documents)
    }
  },

  async documentAdd({ state, dispatch }, { document, idOld }) {
    document = documentEtapeFormat(document)
    const documents = state.element.documents || []
    if (idOld) {
      const index = documents.findIndex(({ id }) => id === idOld)
      documents[index] = document
    } else {
      documents.push(document)
    }

    await dispatch('documentInit', documents)
  },

  async documentRemove({ state, dispatch }, { id }) {
    await dispatch(
      'documentInit',
      state.element.documents.filter(d => d.id !== id)
    )
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

  async pointsImport({ state, commit, dispatch }, { file, geoSystemeId }) {
    try {
      commit('loadingAdd', 'pointsImport', { root: true })

      const { points, surface, documentTypeIds, alertes } = await pointsImporter({
        file,
        geoSystemeId,
        demarcheId: state.metas.demarche.id,
        etapeTypeId: state.element.type.id,
      })
      // pour modifier la surface, on doit désactiver l’héritage
      state.element.heritageProps.surface.actif = false
      state.element.surface = surface
      commit('set', state.element)

      commit('metasSet', {
        sdomZonesDocumentTypeIds: documentTypeIds,
        alertes,
      })
      await dispatch('documentInit', state.element.documents)
      commit('popupClose', null, { root: true })
      dispatch(
        'messageAdd',
        {
          value: `${points.length} points ont été importés avec succès`,
          type: 'success',
        },
        { root: true }
      )
    } catch (e) {
      commit('popupMessageAdd', { value: e, type: 'error' }, { root: true })
    } finally {
      commit('loadingRemove', 'pointsImport', { root: true })
    }
  }
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
      documentsTypes: [],
      sdomZonesDocumentTypeIds: [],
      alertes: [],
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
      if (id === 'entreprises') {
        state.metas[id] = data[id].elements
      } else {
        state.metas[id] = data[id]
      }
    })
  },

  documentsSet(state, documents) {
    state.element.documents = documents
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
