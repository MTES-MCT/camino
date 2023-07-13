import { markRaw } from 'vue'
import FiltresEtapes from './filtres-custom-etapes.vue'
import { elementsFormat } from '../../utils/index'
import { SubstancesLegales } from 'camino-common/src/static/substancesLegales'
import { sortedDomaines } from 'camino-common/src/static/domaines'
import { sortedTitreTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { sortedTitresStatuts } from 'camino-common/src/static/titresStatuts'
import { titresFiltres, titresRechercherByNom } from '@/api/titres'
import { sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'
import { sortedDemarchesTypes } from 'camino-common/src/static/demarchesTypes'

const etapesElementsFormat = (id, metas) => metas.etapesTypes


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
    id: 'titresDomainesIds',
    name: 'Domaines',
    type: 'checkboxes',
    value: [],
    elements: sortedDomaines,
    component: 'FiltreDomaine',
  },
  {
    id: 'titresTypesIds',
    name: 'Types de titre',
    type: 'checkboxes',
    value: [],
    elements: sortedTitreTypesTypes,
  },
  {
    id: 'titresStatutsIds',
    name: 'Statuts de titre',
    type: 'checkboxes',
    value: [],
    elements: sortedTitresStatuts,
    component: 'FiltresStatuts',
  },
  {
    id: 'titresEntreprisesIds',
    type: 'autocomplete',
    value: [],
    name: 'Entreprises',
    elementsFormat,
  },
  {
    id: 'titresSubstancesIds',
    type: 'autocomplete',
    value: [],
    elements: SubstancesLegales,
    name: 'Substances',
  },
  {
    id: 'titresReferences',
    type: 'input',
    value: '',
    name: 'Références',
    placeholder: 'Référence DGEC, DEAL, DEB, BRGM, Ifremer, …',
  },
  {
    id: 'titresTerritoires',
    type: 'input',
    value: '',
    name: 'Territoires',
    placeholder: 'Commune, département, région, …',
  },
  {
    id: 'typesIds',
    name: 'Types',
    type: 'checkboxes',
    value: [],
    elements: sortedDemarchesTypes,
  },
  {
    id: 'statutsIds',
    name: 'Statuts',
    type: 'checkboxes',
    value: [],
    elements: sortedDemarchesStatuts,
    component: 'FiltresStatuts',
  },
  {
    id: 'etapesInclues',
    name: "Types d'étapes incluses",
    type: 'custom',
    value: [],
    elements: [],
    component: markRaw(FiltresEtapes),
    elementsFormat: etapesElementsFormat,
  },
  {
    id: 'etapesExclues',
    name: "Types d'étapes exclues",
    type: 'custom',
    value: [],
    elements: [],
    component: markRaw(FiltresEtapes),
    elementsFormat: etapesElementsFormat,
  },
]

export default filtres
