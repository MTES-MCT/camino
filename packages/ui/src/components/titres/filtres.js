import { elementsFormat } from '../../utils/index'
import { titresFiltres, titresRechercherByNom } from '@/api/titres'
import { SubstancesLegales } from 'camino-common/src/static/substancesLegales'
import { sortedDomaines } from 'camino-common/src/static/domaines'
import { sortedTitresStatuts } from 'camino-common/src/static/titresStatuts'
import { sortedTitreTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { departements } from 'camino-common/src/static/departement'
import { regions } from 'camino-common/src/static/region'
import { pays } from 'camino-common/src/static/pays'
import { FACADES } from 'camino-common/src/static/facades'

const filtres = [
  {
    id: 'titresIds',
    type: 'autocomplete',
    value: [],
    elements: [],
    name: 'Noms',
    lazy: true,
    search: value => titresRechercherByNom({ noms: value, intervalle: 100 }),
    load: value => titresFiltres({ titresIds: value })
  },
  {
    id: 'entreprisesIds',
    type: 'autocomplete',
    value: [],
    name: 'Entreprises',
    elementsFormat
  },
  {
    id: 'substancesIds',
    type: 'autocomplete',
    value: [],
    elements: SubstancesLegales,
    name: 'Substances'
  },
  {
    id: 'references',
    type: 'input',
    value: '',
    name: 'Références',
    placeholder: 'Référence DGEC, DEAL, DEB, BRGM, Ifremer, …'
  },
  {
    id: 'communes',
    type: 'input',
    value: '',
    name: 'Communes',
    placeholder: 'Communes'
  },
  {
    id: 'departements',
    name: 'Départements',
    type: 'autocomplete',
    value: [],
    elements: departements
  },
  {
    id: 'regions',
    name: 'Régions',
    type: 'autocomplete',
    value: [],
    elements: regions
  },
  {
    id: 'pays',
    name: 'Pays',
    type: 'autocomplete',
    value: [],
    elements: pays
  },

  {
    id: 'facadesMaritimes',
    name: 'Façades Maritimes',
    type: 'autocomplete',
    value: [],
    elements: FACADES.map(facade => ({ id: facade, nom: facade }))
  },
  {
    id: 'domainesIds',
    name: 'Domaines',
    type: 'checkboxes',
    value: [],
    elements: sortedDomaines,
    component: 'FiltreDomaine'
  },
  {
    id: 'typesIds',
    name: 'Types',
    type: 'checkboxes',
    value: [],
    elements: sortedTitreTypesTypes,
    component: 'FiltresTypes'
  },
  {
    id: 'statutsIds',
    name: 'Statuts',
    type: 'checkboxes',
    value: [],
    elements: sortedTitresStatuts,
    component: 'FiltresStatuts'
  }
]

export default filtres
