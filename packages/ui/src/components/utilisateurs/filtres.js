import { elementsFormat } from '../../utils/index'
import { ROLES } from 'camino-common/src/roles'
import { sortedAdministrations } from 'camino-common/src/static/administrations'

const utilisateursFiltres = [
  {
    id: 'noms',
    type: 'input',
    value: '',
    name: 'Noms, prénoms',
    placeholder: '...',
  },
  {
    id: 'emails',
    type: 'input',
    value: '',
    name: 'Emails',
    placeholder: 'prenom.nom@domaine.fr, ...',
  },
  {
    id: 'roles',
    name: 'Rôles',
    type: 'checkboxes',
    value: [],
    elements: ROLES.map(r => ({ id: r, nom: r })),
  },
  {
    id: 'administrationIds',
    name: 'Administrations',
    type: 'select',
    value: [],
    elements: sortedAdministrations,
    buttonAdd: 'Ajouter une administration',
    elementName: 'abreviation',
  },
  {
    id: 'entrepriseIds',
    type: 'autocomplete',
    value: [],
    name: 'Entreprises',
    elementsFormat,
  },
]

export default utilisateursFiltres
