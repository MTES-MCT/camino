import { markRaw } from 'vue'
import FiltresEtapes from './filtres-custom-etapes.vue'

const etapesElementsFormat = (id, metas) => metas.etapesTypes

const filtres = [
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
