import { List } from '../_ui/list'
import { UserNotNull, isAdministration, isBureauDEtudes, isEntreprise } from 'camino-common/src/roles'
import { Administrations } from 'camino-common/src/static/administrations'
import { Column, ComponentColumnData, TableRow, TextColumnData } from '../_ui/table'
import { markRaw } from 'vue'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'

export const utilisateursColonnes = [
  {
    id: 'nom',
    name: 'Nom',
  },
  {
    id: 'prenom',
    name: 'Prénom',
  },
  {
    id: 'email',
    name: 'Email',
  },
  {
    id: 'role',
    name: 'Rôle',
  },
  {
    id: 'lien',
    name: 'Lien',
    noSort: true,
  },
] as const satisfies readonly Column[]

export const utilisateursLignesBuild = (utilisateurs: UserNotNull[], entreprises: Entreprise[]): TableRow[] => {
  const entreprisesIndex = entreprises.reduce<Record<EntrepriseId, Entreprise>>((acc, e) => {
    acc[e.id] = e

    return acc
  }, {})

  return utilisateurs.map(utilisateur => {
    let elements

    if (isAdministration(utilisateur)) {
      elements = [Administrations[utilisateur.administrationId].abreviation]
    } else if (isEntreprise(utilisateur) || isBureauDEtudes(utilisateur)) {
      elements = utilisateur.entrepriseIds?.map(id => entreprisesIndex[id].nom)
    }

    const lien: ComponentColumnData | TextColumnData =
      elements && elements.length
        ? {
            component: markRaw(List),
            props: {
              elements,
              mini: true,
            },
            class: 'mb--xs',
            value: elements.join(', '),
          }
        : { value: '' }

    const columns: TableRow['columns'] = {
      prenom: { value: utilisateur.prenom || '–' },
      nom: { value: utilisateur.nom || '–' },
      email: { value: utilisateur.email || '–', class: ['h6'] },
      role: {
        value: utilisateur.role,
        class: ['bg-neutral', 'color-bg', 'pill', 'py-xs', 'px-s', 'small', 'bold'],
      },
      lien,
    }

    return {
      id: utilisateur.id,
      link: { name: 'utilisateur', params: { id: utilisateur.id } },
      columns,
    }
  })
}
