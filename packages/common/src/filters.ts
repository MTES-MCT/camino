import { ROLES, roleValidator } from './roles.js'
import { ADMINISTRATION_TYPES, administrationIdValidator, administrationTypeIdValidator, sortedAdministrations } from './static/administrations.js'
import { departementIdValidator, departements } from './static/departement.js'
import { regionIdValidator, regions } from './static/region.js'
import { FACADES, facadeMaritimeIdValidator } from './static/facades.js'
import { SubstancesLegales, substanceLegaleIdValidator } from './static/substancesLegales.js'
import { domaineIdValidator, sortedDomaines } from './static/domaines.js'
import { titresStatutsArray, titreStatutIdValidator } from './static/titresStatuts.js'
import { sortedTitreTypesTypes, titreTypeTypeIdValidator } from './static/titresTypesTypes.js'
import { titreIdValidator } from './titres.js'
import { z, ZodType } from 'zod'
import { entrepriseIdValidator, Entreprise } from './entreprise.js'
import { activiteTypeIdValidator, sortedActivitesTypes } from './static/activitesTypes.js'
import { activiteStatutIdValidator, activitesStatuts } from './static/activitesStatuts.js'
import { caminoAnneeValidator, getCurrentAnnee, intervalleAnnees, toCaminoAnnee } from './date.js'
import { demarcheTypeIdValidator, sortedDemarchesTypes } from './static/demarchesTypes.js'
import { demarcheStatutIdValidator, sortedDemarchesStatuts } from './static/demarchesStatuts.js'
import { DownloadFormat } from './rest.js'

export const caminoFiltres = {
  nomsAdministration: {
    id: 'nomsAdministration',
    type: 'input',
    name: 'Nom',
    placeholder: `Nom de l'administration`,
    validator: z.string(),
  },
  administrationTypesIds: {
    id: 'administrationTypesIds',
    name: "Type d'administration",
    type: 'checkboxes',
    elements: Object.values(ADMINISTRATION_TYPES),
    component: 'FiltresLabel',
    validator: z.array(administrationTypeIdValidator),
  },
  nomsUtilisateurs: {
    id: 'nomsUtilisateurs',
    type: 'input',
    name: 'Noms, prénoms',
    placeholder: '...',
    validator: z.string(),
  },
  emails: {
    id: 'emails',
    type: 'input',
    validator: z.string(),
    name: 'Emails',
    placeholder: 'prenom.nom@domaine.fr, ...',
  },
  roles: {
    id: 'roles',
    name: 'Rôles',
    type: 'checkboxes',
    component: 'FiltresLabel',
    elements: ROLES.map(r => ({ id: r, nom: r })),
    validator: z.array(roleValidator),
  },
  administrationIds: {
    id: 'administrationIds',
    name: 'Administrations',
    type: 'autocomplete',
    elements: sortedAdministrations,
    lazy: false,
    validator: z.array(administrationIdValidator),
  },
  entreprisesIds: {
    id: 'entreprisesIds',
    type: 'autocomplete',
    name: 'Entreprises',
    elements: [] as Entreprise[],
    lazy: false,
    validator: z.array(entrepriseIdValidator),
  },
  titresIds: {
    id: 'titresIds',
    type: 'autocomplete',
    elements: [] as unknown[],
    name: 'Noms',
    lazy: true,
    validator: z.array(titreIdValidator),
  },
  substancesIds: {
    id: 'substancesIds',
    type: 'autocomplete',
    elements: [...SubstancesLegales].sort((a, b) => a.nom.localeCompare(b.nom)),
    name: 'Substances',
    lazy: false,
    validator: z.array(substanceLegaleIdValidator),
  },
  references: {
    id: 'references',
    type: 'input',
    name: 'Références',
    placeholder: 'Référence DGEC, DEAL, DEB, BRGM, Ifremer, …',
    validator: z.string(),
  },
  communes: {
    id: 'communes',
    type: 'input',
    name: 'Communes',
    placeholder: 'Communes',
    validator: z.string(),
  },
  departements: {
    id: 'departements',
    name: 'Départements',
    type: 'autocomplete',
    elements: departements.sort((a, b) => a.id.localeCompare(b.id)).map(d => ({ ...d, nom: `${d.nom} (${d.id})` })),
    lazy: false,
    validator: z.array(departementIdValidator),
  },
  regions: {
    id: 'regions',
    name: 'Régions',
    type: 'autocomplete',
    elements: regions.sort((a, b) => a.nom.localeCompare(b.nom)),
    lazy: false,
    validator: z.array(regionIdValidator),
  },
  facadesMaritimes: {
    id: 'facadesMaritimes',
    name: 'Façades Maritimes',
    type: 'autocomplete',
    elements: FACADES.sort((a, b) => a.localeCompare(b)).map(facade => ({ id: facade, nom: facade })),
    lazy: false,
    validator: z.array(facadeMaritimeIdValidator),
  },
  domainesIds: {
    id: 'domainesIds',
    name: 'Domaines',
    type: 'checkboxes',
    elements: sortedDomaines,
    component: 'FiltreDomaine',
    validator: z.array(domaineIdValidator),
  },
  typesIds: {
    id: 'typesIds',
    name: 'Types de titre',
    type: 'checkboxes',
    elements: sortedTitreTypesTypes,
    component: 'FiltresTypes',
    validator: z.array(titreTypeTypeIdValidator),
  },
  activiteTypesIds: {
    id: 'activiteTypesIds',
    name: "Types d'activités",
    type: 'checkboxes',
    elements: sortedActivitesTypes,
    component: 'FiltresLabel',
    validator: z.array(activiteTypeIdValidator),
  },
  statutsIds: {
    id: 'statutsIds',
    name: 'Statuts de titre',
    type: 'checkboxes',
    elements: titresStatutsArray,
    component: 'FiltresTitresStatuts',
    validator: z.array(titreStatutIdValidator),
  },
  activiteStatutsIds: {
    id: 'activiteStatutsIds',
    name: "Statuts d'activité",
    type: 'checkboxes',
    elements: activitesStatuts,
    component: 'FiltresStatuts',
    validator: z.array(activiteStatutIdValidator),
  },
  annees: {
    id: 'annees',
    name: 'Années',
    type: 'autocomplete',
    elements: intervalleAnnees(toCaminoAnnee('1997'), getCurrentAnnee()).map(annee => ({ id: annee, nom: annee })),
    lazy: false,
    validator: z.array(caminoAnneeValidator),
  },

  titresTerritoires: {
    id: 'titresTerritoires',
    type: 'input',
    name: 'Territoires',
    placeholder: 'Commune, département, région, …',
    validator: z.string(),
  },
  demarchesTypesIds: {
    id: 'demarchesTypesIds',
    name: 'Types de démarche',
    type: 'checkboxes',
    elements: sortedDemarchesTypes.filter(({ travaux }) => !travaux),
    component: 'FiltresLabel',
    validator: z.array(demarcheTypeIdValidator),
  },
  travauxTypesIds: {
    id: 'travauxTypesIds',
    name: 'Types de travaux',
    type: 'checkboxes',
    elements: sortedDemarchesTypes.filter(({ travaux }) => travaux),
    component: 'FiltresLabel',
    validator: z.array(demarcheTypeIdValidator),
  },
  demarchesStatutsIds: {
    id: 'demarchesStatutsIds',
    name: 'Statuts de démarche',
    type: 'checkboxes',
    elements: sortedDemarchesStatuts,
    component: 'FiltresStatuts',
    validator: z.array(demarcheStatutIdValidator),
  },
  nomsEntreprise: {
    id: 'nomsEntreprise',
    type: 'input',
    name: 'Nom / Siren / Siret',
    placeholder: `Nom d'entreprise ou d'établissement, Siren, ou Siret`,
    validator: z.string(),
  },
  etapesInclues: {
    id: 'etapesInclues',
    name: "Types d'étapes incluses",
    type: 'etape',
    validator: z.any(),
  },
  etapesExclues: {
    id: 'etapesExclues',
    name: "Types d'étapes exclues",
    type: 'etape',
    validator: z.any(),
  },
  // TODO 2023-07-20 add correct satisfies
} as const satisfies {
  [key in string]: {
    id: key
    type: 'etape' | 'select' | 'checkboxes' | 'input' | 'autocomplete'
    name: string
    placeholder?: string
    validator: ZodType
    elements?: unknown[]
    component?: 'FiltresLabel' | 'FiltresTypes' | 'FiltreDomaine' | 'FiltresTitresStatuts' | 'FiltresStatuts'
    lazy?: boolean
  }
}

export type CaminoFiltre = keyof typeof caminoFiltres

export const demarchesFiltresNames = [
  'titresIds',
  'domainesIds',
  'typesIds',
  'statutsIds',
  'entreprisesIds',
  'substancesIds',
  'references',
  'titresTerritoires',
  'demarchesTypesIds',
  'travauxTypesIds',
  'demarchesStatutsIds',
  'etapesInclues',
  'etapesExclues',
] as const satisfies readonly CaminoFiltre[]

export const titresFiltresNames = [
  'titresIds',
  'entreprisesIds',
  'substancesIds',
  'references',
  'communes',
  'departements',
  'regions',
  'facadesMaritimes',
  'domainesIds',
  'typesIds',
  'statutsIds',
] as const satisfies readonly CaminoFiltre[]

export const activitesFiltresNames = [
  'titresIds',
  'entreprisesIds',
  'substancesIds',
  'references',
  'titresTerritoires',
  'domainesIds',
  'typesIds',
  'statutsIds',
  'activiteTypesIds',
  'activiteStatutsIds',
  'annees',
] as const satisfies readonly CaminoFiltre[]

export const entreprisesFiltresNames = ['nomsEntreprise'] as const satisfies readonly CaminoFiltre[]

export const utilisateursFiltresNames = ['nomsUtilisateurs', 'emails', 'roles', 'administrationIds', 'entreprisesIds'] as const satisfies readonly CaminoFiltre[]

const baseDownloadFormats = ['csv', 'xlsx', 'ods'] as const satisfies readonly DownloadFormat[]
export const demarchesDownloadFormats = baseDownloadFormats
export const titresDownloadFormats = ['geojson', ...baseDownloadFormats] as const satisfies readonly DownloadFormat[]
export const activitesDownloadFormats = baseDownloadFormats
export const utilisateursDownloadFormats = baseDownloadFormats
export const entreprisesDownloadFormats = baseDownloadFormats
