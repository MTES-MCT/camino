import { utilisateurs, utilisateurMetas } from '../api/utilisateurs'
import { listeActionsBuild, listeMutationsWithDefaultState } from './_liste-build'

const getDefaultState = () => ({
  elements: [],
  total: 0,
  metas: {
    entreprise: [],
  },
  definitions: [
    { id: 'noms', type: 'string' },
    { id: 'emails', type: 'string' },
    { id: 'roles', type: 'strings', values: [] },
    { id: 'administrationIds', type: 'strings', values: [] },
    { id: 'entrepriseIds', type: 'strings', values: [] },
    { id: 'page', type: 'number', min: 0 },
    { id: 'intervalle', type: 'number', min: 10, max: 500 },
    {
      id: 'colonne',
      type: 'string',
      values: ['nom', 'prenom', 'email', 'role', 'lien'],
    },
    {
      id: 'ordre',
      type: 'string',
      values: ['asc', 'desc'],
    },
  ],
  params: {
    filtres: {
      noms: '',
      emails: '',
      roles: [],
      administrationIds: [],
      entrepriseIds: [],
    },
    table: {
      page: 1,
      intervalle: 200,
      ordre: 'asc',
      colonne: null,
    },
  },
  initialized: false,
})

const state = getDefaultState()

const actions = listeActionsBuild('utilisateurs', 'utilisateurs', utilisateurs, utilisateurMetas)

const mutations = Object.assign({}, listeMutationsWithDefaultState(getDefaultState), {
  metasSet(state, data) {
    state.metas.entreprise = data.elements
  },
})

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
