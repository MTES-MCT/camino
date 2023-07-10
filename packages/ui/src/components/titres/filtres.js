import { elementsFormat } from '../../utils/index'
import { titresFiltres, titresRechercherByNom } from '@/api/titres'
import { SubstancesLegales } from 'camino-common/src/static/substancesLegales'
import { sortedDomaines } from 'camino-common/src/static/domaines'
import { sortedTitresStatuts } from 'camino-common/src/static/titresStatuts'
import { sortedTitreTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { departements } from 'camino-common/src/static/departement'
import { regions } from 'camino-common/src/static/region'
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
    load: value => titresFiltres({ titresIds: value }),
  },
  {
    id: 'entreprisesIds',
    type: 'autocomplete',
    value: [],
    name: 'Entreprises',
    elementsFormat,
  },
  {
    id: 'substancesIds',
    type: 'autocomplete',
    value: [],
    elements: SubstancesLegales.sort((a, b) => a.nom.localeCompare(b.nom)),
    name: 'Substances',
  },
  {
    id: 'references',
    type: 'input',
    value: '',
    name: 'Références',
    placeholder: 'Référence DGEC, DEAL, DEB, BRGM, Ifremer, …',
  },
  {
    id: 'communes',
    type: 'input',
    value: '',
    name: 'Communes',
    placeholder: 'Communes',
  },
  {
    id: 'departements',
    name: 'Départements',
    type: 'autocomplete',
    value: [],
    elements: departements.sort((a, b) => a.id - b.id).map(d => ({ ...d, nom: `${d.nom} (${d.id})` })),
  },
  {
    id: 'regions',
    name: 'Régions',
    type: 'autocomplete',
    value: [],
    elements: regions.sort((a, b) => a.nom.localeCompare(b.nom)),
  },
  {
    id: 'facadesMaritimes',
    name: 'Façades Maritimes',
    type: 'autocomplete',
    value: [],
    elements: FACADES.sort((a, b) => a.localeCompare(b)).map(facade => ({ id: facade, nom: facade })),
  },
  {
    id: 'domainesIds',
    name: 'Domaines',
    type: 'checkboxes',
    value: [],
    elements: sortedDomaines,
    component: 'FiltreDomaine',
  },
  {
    id: 'typesIds',
    name: 'Types',
    type: 'checkboxes',
    value: [],
    elements: sortedTitreTypesTypes,
    component: 'FiltresTypes',
  },
  {
    id: 'statutsIds',
    name: 'Statuts',
    type: 'checkboxes',
    value: [],
    elements: sortedTitresStatuts,
    component: 'FiltresTitresStatuts',
  },
]

export default filtres
