import { activites } from '../api/titres-activites'
import { activitesMetas } from '../api/metas-activites'
import { listeActionsBuild, listeMutations } from './_liste-build'

export const anneesGet = currentYear => {
  const annees = []
  for (let i = currentYear; i >= 1997; i--) {
    annees.push({ id: i, nom: i })
  }

  return annees
}

const state = {
  elements: [],
  total: 0,
  metas: {
    annees: anneesGet(new Date().getFullYear()),
    titresEntreprises: [],
  },
  definitions: [
    { id: 'typesIds', type: 'strings', values: [] },
    { id: 'statutsIds', type: 'strings', values: [] },
    { id: 'annees', type: 'numbers', values: [] },
    { id: 'titresIds', type: 'strings', values: [] },
    { id: 'titresEntreprisesIds', type: 'strings', values: [] },
    { id: 'titresSubstancesIds', type: 'strings', values: [] },
    { id: 'titresReferences', type: 'string' },
    { id: 'titresTerritoires', type: 'string' },
    { id: 'titresTypesIds', type: 'strings', values: [] },
    { id: 'titresDomainesIds', type: 'strings', values: [] },
    { id: 'titresStatutsIds', type: 'strings', values: [] },
    { id: 'page', type: 'number', min: 0 },
    { id: 'intervalle', type: 'number', min: 10, max: 500 },
    {
      id: 'colonne',
      type: 'string',
      values: ['titreNom', 'titulaires', 'annee', 'periode', 'statut'],
    },
    {
      id: 'ordre',
      type: 'string',
      values: ['asc', 'desc'],
    },
  ],
  params: {
    table: {
      page: 1,
      intervalle: 200,
      ordre: 'asc',
      colonne: null,
    },
    filtres: {
      typesIds: [],
      statutsIds: [],
      annees: [],
      titresIds: [],
      titresEntreprisesIds: [],
      titresSubstancesIds: [],
      titresReferences: '',
      titresTerritoires: '',
      titresTypesIds: [],
      titresDomainesIds: [],
      titresStatutsIds: [],
    },
  },
  initialized: false,
}

const actions = listeActionsBuild('titresActivites', 'activités', activites, activitesMetas)

const mutations = Object.assign({}, listeMutations, {
  metasSet(state, data) {
    state.metas.titresEntreprises = data.elements
    const definition = state.definitions.find(p => p.id === 'titresEntreprisesIds')
    definition.values = data.elements.map(e => e.id)
  },
})

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
