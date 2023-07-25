import { elementsFormat } from '../../../utils/index'
import { ROLES, roleValidator } from 'camino-common/src/roles'
import { ADMINISTRATION_TYPES, administrationIdValidator, administrationTypeIdValidator, sortedAdministrations } from 'camino-common/src/static/administrations'
import { departementIdValidator, departements } from 'camino-common/src/static/departement'
import { regionIdValidator, regions } from 'camino-common/src/static/region'
import { FACADES, facadeMaritimeIdValidator } from 'camino-common/src/static/facades'
import { titresFiltres, titresRechercherByNom } from '@/api/titres'
import { SubstancesLegales, substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales'
import { domaineIdValidator, sortedDomaines } from 'camino-common/src/static/domaines'
import { sortedTitresStatuts, titreStatutIdValidator } from 'camino-common/src/static/titresStatuts'
import { sortedTitreTypesTypes, titreTypeTypeIdValidator } from 'camino-common/src/static/titresTypesTypes'
import { TitreId, titreIdValidator } from 'camino-common/src/titres'
import { z, ZodType } from 'zod'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { activiteTypeIdValidator, sortedActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { activiteStatutIdValidator, activitesStatuts } from 'camino-common/src/static/activitesStatuts'
import { caminoAnneeValidator, getCurrentAnnee, intervalleAnnees, toCaminoAnnee } from 'camino-common/src/date'
import { demarcheTypeIdValidator, sortedDemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { demarcheStatutIdValidator, sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'

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
    name: 'Types',
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
    elementsFormat,
    lazy: false,
    validator: z.array(entrepriseIdValidator),
  },
  titresIds: {
    id: 'titresIds',
    type: 'autocomplete',
    elements: [] as unknown[],
    name: 'Noms',
    lazy: true,
    search: (value: string) => titresRechercherByNom({ noms: value, intervalle: 100 }),
    load: (value: TitreId[]) => {
      return titresFiltres({ titresIds: value })
    },
    loadedElements: elements => {
      caminoFiltres.titresIds.elements.splice(0, caminoFiltres.titresIds.elements.length, ...elements)
    },
    validator: z.array(titreIdValidator),
  },
  substancesIds: {
    id: 'substancesIds',
    type: 'autocomplete',
    elements: SubstancesLegales.sort((a, b) => a.nom.localeCompare(b.nom)),
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
    elements: sortedTitresStatuts,
    component: 'FiltresTitresStatuts',
    validator: z.array(titreStatutIdValidator),
  },
  activiteStatutsIds: {
    id: 'activiteStatutsIds',
    name: 'Statuts',
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
    name: 'Types',
    type: 'checkboxes',
    elements: sortedDemarchesTypes,
    component: 'FiltresLabel',
    validator: z.array(demarcheTypeIdValidator),
  },
  demarchesStatutsIds: {
    id: 'demarchesStatutsIds',
    name: 'Types',
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
    search?: (value: string) => Promise<unknown>
    load?: (values: TitreId[]) => Promise<unknown[]>
    loadedElements?: (values: { id: TitreId; nom: string }[]) => void
    /*
   / @deprecated c'est encore des trucs liées au store
   / ça devrait être remplaçait par l'appel api directement dans la structure
   / c'est appelé deux fois, une fois par le composant filters pour afficher les labels, et une fois par le composant autocomplete pour pouvoir sélectionner
  */
    elementsFormat?: (value: any, metas: unknown) => unknown
  }
}
const caminoEtapesFiltresArrayIds = ['etapesInclues', 'etapesExclues'] as const
export const caminoEtapesFiltres = [caminoFiltres.etapesInclues, caminoFiltres.etapesExclues] as const satisfies readonly { type: 'etape' }[]
export type EtapeCaminoFiltres = (typeof caminoEtapesFiltres)[number]['id']
export const isEtapeCaminoFiltre = (value: CaminoFiltres): value is EtapeCaminoFiltres => caminoEtapesFiltresArrayIds.includes(value)

const caminoInputFiltresArrayIds = ['nomsAdministration', 'nomsUtilisateurs', 'emails', 'references', 'communes', 'nomsEntreprise', 'titresTerritoires'] as const
export const caminoInputFiltres = [
  caminoFiltres.nomsAdministration,
  caminoFiltres.nomsUtilisateurs,
  caminoFiltres.emails,
  caminoFiltres.references,
  caminoFiltres.communes,
  caminoFiltres.nomsEntreprise,
  caminoFiltres.titresTerritoires,
] as const satisfies readonly { type: 'input' }[]
export type InputCaminoFiltres = (typeof caminoInputFiltres)[number]['id']
export const isInputCaminoFiltre = (value: CaminoFiltres): value is InputCaminoFiltres => caminoInputFiltresArrayIds.includes(value)

const caminoAutocompleteFiltresArrayIds = ['substancesIds', 'administrationIds', 'entreprisesIds', 'titresIds', 'departements', 'regions', 'facadesMaritimes', 'annees'] as const
export const caminoAutocompleteFiltres = [
  caminoFiltres.substancesIds,
  caminoFiltres.administrationIds,
  caminoFiltres.entreprisesIds,
  caminoFiltres.titresIds,
  caminoFiltres.departements,
  caminoFiltres.regions,
  caminoFiltres.facadesMaritimes,
  caminoFiltres.annees,
] as const satisfies readonly {
  type: 'autocomplete'
}[]
export type AutocompleteCaminoFiltres = (typeof caminoAutocompleteFiltres)[number]['id']
export const isAutocompleteCaminoFiltre = (value: CaminoFiltres): value is AutocompleteCaminoFiltres => caminoAutocompleteFiltresArrayIds.includes(value)

const caminoCheckboxesFiltresArrayIds = [
  'administrationTypesIds',
  'roles',
  'typesIds',
  'domainesIds',
  'statutsIds',
  'activiteTypesIds',
  'activiteStatutsIds',
  'demarchesTypesIds',
  'demarchesStatutsIds',
] as const
export const caminoCheckboxesFiltres = [
  caminoFiltres.administrationTypesIds,
  caminoFiltres.roles,
  caminoFiltres.typesIds,
  caminoFiltres.domainesIds,
  caminoFiltres.statutsIds,
  caminoFiltres.activiteTypesIds,
  caminoFiltres.activiteStatutsIds,
  caminoFiltres.demarchesTypesIds,
  caminoFiltres.demarchesStatutsIds,
] as const satisfies readonly { type: 'checkboxes' }[]
export type CheckboxesCaminoFiltres = (typeof caminoCheckboxesFiltres)[number]['id']
export const isCheckboxeCaminoFiltre = (value: CaminoFiltres): value is CheckboxesCaminoFiltres => caminoCheckboxesFiltresArrayIds.includes(value)

export type CaminoFiltres = InputCaminoFiltres | CheckboxesCaminoFiltres | AutocompleteCaminoFiltres | EtapeCaminoFiltres

export const allCaminoFiltres = [...caminoInputFiltresArrayIds, ...caminoAutocompleteFiltresArrayIds, ...caminoCheckboxesFiltresArrayIds, ...caminoEtapesFiltresArrayIds] as const
