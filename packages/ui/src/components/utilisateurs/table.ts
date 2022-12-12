import List from '../_ui/list.vue'
import {
  isAdministration,
  isBureauDEtudes,
  isEntreprise,
  User
} from 'camino-common/src/roles'
import { Administrations } from 'camino-common/src/static/administrations'
import { Column } from '@/components/_ui/table-auto.type'
import { Utilisateur } from '@/api/api-client'

export const utilisateursColonnes: Column[] = [
  {
    id: 'nom',
    name: 'Nom',
    class: ['min-width-6']
  },
  {
    id: 'prenom',
    name: 'Prénom',
    class: ['min-width-6']
  },
  {
    id: 'email',
    name: 'Email'
  },
  {
    id: 'role',
    name: 'Rôle',
    class: ['min-width-6']
  },
  {
    id: 'lien',
    name: 'Lien',
    noSort: true,
    class: ['min-width-6']
  }
]

export const utilisateursLignesBuild = (utilisateurs: Utilisateur[]) =>
  utilisateurs.map(utilisateur => {
    let elements

    if (isAdministration(utilisateur)) {
      elements = [Administrations[utilisateur.administrationId].abreviation]
    } else if (isEntreprise(utilisateur) || isBureauDEtudes(utilisateur)) {
      elements = utilisateur.entreprises?.map(({ nom }) => nom)
    }

    const lien =
      elements && elements.length
        ? {
            component: List,
            props: {
              elements,
              mini: true
            },
            class: 'mb--xs',
            value: elements.join(', ')
          }
        : { value: '' }

    const columns = {
      prenom: { value: utilisateur.prenom || '–' },
      nom: { value: utilisateur.nom || '–' },
      email: { value: utilisateur.email || '–', class: ['h6'] },
      role: {
        value: utilisateur.role,
        class: [
          'bg-neutral',
          'color-bg',
          'pill',
          'py-xs',
          'px-s',
          'small',
          'bold'
        ]
      },
      lien
    }

    return {
      id: utilisateur.id,
      link: { name: 'utilisateur', params: { id: utilisateur.id } },
      columns
    }
  })
