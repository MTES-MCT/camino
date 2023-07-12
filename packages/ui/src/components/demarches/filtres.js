import { markRaw } from 'vue'
import FiltresEtapes from './filtres-custom-etapes.vue'
import { elementsFormat } from '../../utils/index'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { SubstancesLegales } from 'camino-common/src/static/substancesLegales'
import { sortedDomaines } from 'camino-common/src/static/domaines'
import { sortedTitreTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { sortedTitresStatuts } from 'camino-common/src/static/titresStatuts'
import { titresFiltres, titresRechercherByNom } from '@/api/titres'
import { sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'
import { sortedDemarchesTypes } from 'camino-common/src/static/demarchesTypes'

const etapesElementsFormat = (id, metas) => metas.etapesTypes
const etapesLabelFormat = f =>
  f.value
    .filter(value => value.typeId)
    .map(value => ({
      id: f.id,
      name: f.name,
      value,
      valueName: Object.keys(value)
        .map(k => {
          let key
          let val = value[k]
          let order

          if (k === 'typeId') {
            const element = f.elements.find(e => e.id === value.typeId)
            key = 'type'
            val = element.nom
            order = 1
          } else if (k === 'statutId') {
            key = 'statut'
            val = EtapesStatuts[value.statutId].nom
            order = 2
          } else if (k === 'dateDebut') {
            key = 'après le'
            order = 3
          } else if (k === 'dateFin') {
            key = 'avant le'
            order = 4
          }

          return { label: `${key} : ${val}`, order }
        })
        .sort((a, b) => a.order - b.order)
        .map(value => value.label)
        .join(', '),
    }))

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
    labelFormat: etapesLabelFormat,
  },
  {
    id: 'etapesExclues',
    name: "Types d'étapes exclues",
    type: 'custom',
    value: [],
    elements: [],
    component: markRaw(FiltresEtapes),
    elementsFormat: etapesElementsFormat,
    labelFormat: etapesLabelFormat,
  },
]

export default filtres
