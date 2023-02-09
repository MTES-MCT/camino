import { demarchesMetas, demarches } from '../api/titres-demarches'
import { listeActionsBuild, listeMutations } from './_liste-build'

const state = {
  elements: [],
  total: 0,
  metas: {
    etapesTypes: [],
    titresTypes: [],
    titresStatuts: [],
    titresEntreprises: []
  },
  definitions: [
    { id: 'typesIds', type: 'strings', values: [] },
    { id: 'statutsIds', type: 'strings', values: [] },
    { id: 'etapesInclues', type: 'objects', values: [] },
    { id: 'etapesExclues', type: 'objects', values: [] },
    { id: 'titresDomainesIds', type: 'strings', values: [] },
    { id: 'titresTypesIds', type: 'strings', values: [] },
    { id: 'titresStatutsIds', type: 'strings', values: [] },
    { id: 'titresIds', type: 'strings', values: [] },
    { id: 'titresEntreprisesIds', type: 'strings', values: [] },
    { id: 'titresSubstancesIds', type: 'strings', values: [] },
    { id: 'titresReferences', type: 'string' },
    { id: 'titresTerritoires', type: 'string' },
    { id: 'page', type: 'number', min: 0 },
    { id: 'intervalle', type: 'number', min: 10, max: 500 },
    {
      id: 'colonne',
      type: 'string',
      values: [
        'titreNom',
        'titreDomaine',
        'titreType',
        'titreStatut',
        'type',
        'statut',
        'reference'
      ]
    },
    {
      id: 'ordre',
      type: 'string',
      values: ['asc', 'desc']
    }
  ],
  params: {
    table: {
      page: 1,
      intervalle: 200,
      ordre: 'asc',
      colonne: null
    },
    filtres: {
      typesIds: [],
      statutsIds: [],
      etapesInclues: [],
      etapesExclues: [],
      titresDomainesIds: [],
      titresTypesIds: [],
      titresStatutsIds: [],
      titresIds: [],
      titresEntreprisesIds: [],
      titresSubstancesIds: [],
      titresReferences: '',
      titresTerritoires: ''
    }
  },
  initialized: false
}

const actions = listeActionsBuild(
  'titresDemarches',
  'démarches',
  demarches,
  demarchesMetas
)

const mutations = Object.assign({}, listeMutations, {
  reset(state) {
    listeMutations.reset(state)
    state.metas = {
      etapesTypes: [],
      titresTypes: [],
      titresStatuts: [],
      titresEntreprises: []
    }
    state.params = {
      table: {
        page: 1,
        intervalle: 200,
        ordre: 'asc',
        colonne: null
      },
      filtres: {
        typesIds: [],
        statutsIds: [],
        etapesInclues: [],
        etapesExclues: [],
        titresDomainesIds: [],
        titresTypesIds: [],
        titresStatutsIds: [],
        titresIds: [],
        titresEntreprisesIds: [],
        titresSubstancesIds: [],
        titresReferences: '',
        titresTerritoires: ''
      }
    }
  },
  metasSet(state, data) {
    Object.keys(data).forEach(id => {
      let metaId
      let paramsIds

      if (id === 'etapesTypes') {
        metaId = 'etapesTypes'
        paramsIds = ['etapesInclues', 'etapesExclues']
      } else if (id === 'statuts') {
        metaId = 'titresStatuts'
        paramsIds = ['titresStatutsIds']
      } else if (id === 'types') {
        metaId = 'titresTypes'
        paramsIds = ['titresTypesIds']
      } else if (id === 'entreprises') {
        metaId = 'titresEntreprises'
        paramsIds = ['titresEntreprisesIds']
        data[id] = data[id].elements
      }

      if (metaId) {
        state.metas[metaId] = data[id]
      }

      if (paramsIds) {
        paramsIds.forEach(paramId => {
          const definition = state.definitions.find(p => p.id === paramId)
          definition.values = data[id].map(e => e.id)
        })
      }
    })
  }
})

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
