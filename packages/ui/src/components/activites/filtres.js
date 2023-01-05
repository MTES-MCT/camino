import { FiltresStatuts } from '../_common/filtres/statuts'
import { FiltreDomaine } from '../_common/filtres/domaine'
import { FiltresTypes } from '../_common/filtres/types'
import { elementsFormat } from '../../utils/index'
import { markRaw } from 'vue'
import { SubstancesLegales } from 'camino-common/src/static/substancesLegales'
import { sortedDomaines } from 'camino-common/src/static/domaines'
import { titresFiltres, titresRechercherByNom } from '@/api/titres'
import { activitesStatuts } from 'camino-common/src/static/activitesStatuts'
import { sortedActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { sortedTitresStatuts } from 'camino-common/src/static/titresStatuts'

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
    id: 'titresEntreprisesIds',
    type: 'autocomplete',
    value: [],
    name: 'Entreprises',
    elementsFormat
  },
  {
    id: 'titresSubstancesIds',
    type: 'autocomplete',
    value: [],
    name: 'Substances',
    elements: SubstancesLegales
  },
  {
    id: 'titresReferences',
    type: 'input',
    value: '',
    name: 'Références',
    placeholder: 'Référence DGEC, DEAL, DEB, BRGM, Ifremer, …'
  },
  {
    id: 'titresTerritoires',
    type: 'input',
    value: '',
    name: 'Territoires',
    placeholder: 'Commune, département, région, …'
  },
  {
    id: 'titresDomainesIds',
    name: 'Domaines',
    type: 'checkboxes',
    value: [],
    elements: sortedDomaines,
    component: markRaw(FiltreDomaine)
  },
  {
    id: 'titresTypesIds',
    name: 'Types de titre',
    type: 'checkboxes',
    value: [],
    elements: [],
    component: markRaw(FiltresTypes),
    elementsFormat
  },
  {
    id: 'titresStatutsIds',
    name: 'Statuts de titre',
    type: 'checkboxes',
    value: [],
    elements: sortedTitresStatuts,
    component: markRaw(FiltresStatuts)
  },
  {
    id: 'typesIds',
    name: 'Types',
    type: 'checkboxes',
    value: [],
    elements: sortedActivitesTypes
  },
  {
    id: 'statutsIds',
    name: 'Statuts',
    type: 'checkboxes',
    value: [],
    elements: activitesStatuts,
    component: markRaw(FiltresStatuts)
  },
  {
    id: 'annees',
    name: 'Années',
    type: 'select',
    value: [],
    elements: [],
    elementName: 'nom',
    buttonAdd: 'Ajouter une année',
    isNumber: true,
    elementsFormat
  }
]

export default filtres
