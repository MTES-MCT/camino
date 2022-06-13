import { elementsFormat } from '../../utils/index'

const utilisateursFiltres = [
  {
    id: 'noms',
    type: 'input',
    value: '',
    name: 'Noms, prénoms',
    placeholder: '...'
  },
  {
    id: 'emails',
    type: 'input',
    value: '',
    name: 'Emails',
    placeholder: 'prenom.nom@domaine.fr, ...'
  },
  {
    id: 'roles',
    name: 'Rôles',
    type: 'checkboxes',
    value: [],
    elements: []
  },
  {
    id: 'administrationIds',
    name: 'Administrations',
    type: 'select',
    value: [],
    elements: [],
    buttonAdd: 'Ajouter une administration',
    elementName: 'abreviation',
    elementsFormat
  },
  {
    id: 'entrepriseIds',
    name: 'Entreprises',
    type: 'select',
    value: [],
    elements: [],
    buttonAdd: 'Ajouter une entreprise',
    elementName: 'nom',
    elementsFormat
  }
]

export default utilisateursFiltres
