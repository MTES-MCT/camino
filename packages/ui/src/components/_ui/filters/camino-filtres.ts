import { CaminoFiltre, caminoFiltres } from 'camino-common/src/filters'

const caminoEtapesFiltresArrayIds = ['etapesInclues', 'etapesExclues'] as const
export const caminoEtapesFiltres = [caminoFiltres.etapesInclues, caminoFiltres.etapesExclues] as const satisfies readonly { type: 'etape' }[]
export type EtapeCaminoFiltres = (typeof caminoEtapesFiltres)[number]['id']
export const isEtapeCaminoFiltre = (value: CaminoFiltre): value is EtapeCaminoFiltres => caminoEtapesFiltresArrayIds.includes(value)

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
export const isInputCaminoFiltre = (value: CaminoFiltre): value is InputCaminoFiltres => caminoInputFiltresArrayIds.includes(value)

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
export const isAutocompleteCaminoFiltre = (value: CaminoFiltre): value is AutocompleteCaminoFiltres => caminoAutocompleteFiltresArrayIds.includes(value)

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
export const isCheckboxeCaminoFiltre = (value: CaminoFiltre): value is CheckboxesCaminoFiltres => caminoCheckboxesFiltresArrayIds.includes(value)

export const allCaminoFiltres = [...caminoInputFiltresArrayIds, ...caminoAutocompleteFiltresArrayIds, ...caminoCheckboxesFiltresArrayIds, ...caminoEtapesFiltresArrayIds] as const
