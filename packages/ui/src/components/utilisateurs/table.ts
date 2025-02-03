import { List } from '../_ui/list'
import { UserNotNull, isAdministration, isBureauDEtudes, isEntreprise } from 'camino-common/src/roles'
import { Administrations } from 'camino-common/src/static/administrations'
import { Column, ComponentColumnData, JSXElementColumnData, TableRow, TextColumnData } from '../_ui/table'
import { markRaw } from 'vue'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'

export const utilisateursColonnes = [
  {
    id: 'nom',
    contentTitle: 'Nom',
  },
  {
    id: 'prenom',
    contentTitle: 'Prénom',
  },
  {
    id: 'email',
    contentTitle: 'Email',
  },
  {
    id: 'role',
    contentTitle: 'Rôle',
  },
  {
    id: 'lien',
    contentTitle: 'Lien',
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

    const lien: JSXElementColumnData | ComponentColumnData | TextColumnData =
      elements && elements.length
        ? {
            type: 'component',
            component: markRaw(List),
            props: {
              elements,
              mini: true,
            },
            class: 'mb--xs',
            value: elements.join(', '),
          }
        : { type: 'text', value: '' }

    const columns: TableRow['columns'] = {
      prenom: { type: 'text', value: utilisateur.prenom || '–' },
      nom: { type: 'text', value: utilisateur.nom || '–' },
      email: { type: 'text', value: utilisateur.email || '–', class: ['h6'] },
      role: {
        type: 'text',
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
