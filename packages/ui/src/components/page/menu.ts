import { MenuSection } from '@/router'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { Role, User } from 'camino-common/src/roles'
export type Link = { label: string; path: MenuSection }
export type LinkList = { label: string; sublinks: Link[] }
const links = {
  TITRES_ET_AUTORISATIONS: { label: 'Titres et autorisations', path: 'titres' },
  DEMARCHES: { label: 'Démarches', path: 'demarches' },
  TRAVAUX: { label: 'Travaux', path: 'travaux' },
  ACTIVITES: { label: 'Activités', path: 'activites' },
  STATISTIQUES: { label: 'Statistiques', path: 'statistiques' },
  ENTREPRISES: { label: 'Entreprises', path: 'entreprises' },
  UTILISATEURS: { label: 'Utilisateurs', path: 'utilisateurs' },
  ADMINISTRATIONS: { label: 'Administrations', path: 'administrations' },
  JOURNAUX: { label: 'Journaux', path: 'journaux' },
  TABLEAU_DE_BORD: { label: 'Tableau de bord', path: 'dashboard' },
} as const satisfies Record<string, Link>

export const isDirectLink = (link: Link | LinkList): link is Link => Object.prototype.hasOwnProperty.call(link, 'path')
type Annuaire = { label: string; sublinks: Link[] }
const ANNUAIRE: Annuaire = { label: 'Annuaire', sublinks: [links.ENTREPRISES, links.ADMINISTRATIONS, links.UTILISATEURS] }

export const linksByRole = (user: User): Record<Role, (Link | Annuaire)[]> => {
  const linkActivites: Link[] = canReadActivites(user) ? [links.ACTIVITES] : []

  return {
    super: [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, ...linkActivites, links.STATISTIQUES, ANNUAIRE, links.JOURNAUX],
    admin: [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, ...linkActivites, links.STATISTIQUES, ANNUAIRE],
    editeur: [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, ...linkActivites, links.STATISTIQUES, ANNUAIRE],
    lecteur: [links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, links.STATISTIQUES, ANNUAIRE],
    entreprise: [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, ...linkActivites, links.STATISTIQUES, ANNUAIRE],
    "bureau d'études": [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.STATISTIQUES, ANNUAIRE],
    defaut: [links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.STATISTIQUES, { label: 'Annuaire', sublinks: [links.ENTREPRISES, links.ADMINISTRATIONS] }],
  }
}
