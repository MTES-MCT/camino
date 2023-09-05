import { getKeys, PartialRecord } from '../typescript-tools.js'
import { AdministrationId, Administrations, AdministrationTypeId, ADMINISTRATION_TYPE_IDS, IDS } from './administrations.js'
import { isTitreType, TITRES_TYPES_IDS, TitreTypeId } from './titresTypes.js'

type AdministrationTitreType = PartialRecord<
  TitreTypeId,
  {
    gestionnaire: boolean
    associee: boolean
  }
>
const AdministrationsTypesTitresTypes: { [key in AdministrationTypeId]?: Readonly<AdministrationTitreType> } = {
  [ADMINISTRATION_TYPE_IDS.DREAL]: {
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GEOTHERMIE]: { gestionnaire: true, associee: false },
  },
} as const

const AdministrationsTitresTypes: { [key in AdministrationId]?: Readonly<AdministrationTitreType> } = {
  'aut-97300-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: false, associee: true },
  },
  'aut-mrae-guyane-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: false, associee: true },
  },
  'dea-guyane-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: { gestionnaire: true, associee: false },
  },
  'dre-aura-01': {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: { gestionnaire: false, associee: false },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: { gestionnaire: false, associee: false },
  },
  'dre-bfc-01': {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: { gestionnaire: false, associee: false },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: { gestionnaire: false, associee: false },
  },
  'dre-ile-de-france-01': {
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES]: { gestionnaire: true, associee: false },
  },
  'min-dajb-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_CARRIERES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_FOSSILES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.INDETERMINE_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.INDETERMINE_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_FOSSILES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_FOSSILES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
  },
  'min-mctrct-dgcl-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.INDETERMINE_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
  },
  'min-mtes-dgaln-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_METAUX]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_CARRIERES]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: true, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: { gestionnaire: true, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_FOSSILES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.CONCESSION_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.INDETERMINE_METAUX]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.INDETERMINE_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_FOSSILES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_FOSSILES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS]: { gestionnaire: true, associee: false },
  },
  'min-mtes-dgec-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_HYDROCARBURE]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_CARRIERES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_GEOTHERMIE]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_FOSSILES]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.CONCESSION_GEOTHERMIE]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.INDETERMINE_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.INDETERMINE_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_FOSSILES]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_HYDROCARBURE]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: { gestionnaire: true, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_FOSSILES]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GEOTHERMIE]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_HYDROCARBURE]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_RADIOACTIF]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
  },
  'min-mtes-dgpr-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_CARRIERES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_FOSSILES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_RADIOACTIF]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.INDETERMINE_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.INDETERMINE_RADIOACTIF]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_FOSSILES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_FOSSILES]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GEOTHERMIE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_HYDROCARBURE]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: { gestionnaire: false, associee: true },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_RADIOACTIF]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS]: { gestionnaire: false, associee: true },
  },
  'ope-brgm-01': {
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES]: { gestionnaire: false, associee: true },
  },
  'ope-brgm-02': {
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: { gestionnaire: false, associee: true },
  },
  'ope-onf-973-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: true, associee: false },
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: { gestionnaire: true, associee: false },
  },
  'ope-ptmg-973-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: true, associee: true },
  },
  'pre-97302-01': {
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { gestionnaire: false, associee: true },
  },
} as const

export const getTitreTypeIdsByAdministration = (administrationId: AdministrationId): { titreTypeId: TitreTypeId; gestionnaire: boolean; associee: boolean }[] => {
  const administrationTypeTitresTypes = AdministrationsTypesTitresTypes[Administrations[administrationId].typeId]
  const administrationTitresTypes = Object.assign({}, administrationTypeTitresTypes ?? {}, AdministrationsTitresTypes[administrationId] ?? {})

  return getKeys(administrationTitresTypes, isTitreType).reduce<{ titreTypeId: TitreTypeId; gestionnaire: boolean; associee: boolean }[]>((acc, titreTypeId) => {
    acc.push({ titreTypeId, gestionnaire: administrationTitresTypes[titreTypeId]?.gestionnaire ?? false, associee: administrationTitresTypes[titreTypeId]?.associee ?? false })

    return acc
  }, [])
}

export const isGestionnaire = (administrationId: AdministrationId, titreTypeId?: TitreTypeId): boolean => isGestionnaireOrAssociee(administrationId, 'gestionnaire', titreTypeId)
export const isAssociee = (administrationId: AdministrationId, titreTypeId?: TitreTypeId): boolean => isGestionnaireOrAssociee(administrationId, 'associee', titreTypeId)

const isGestionnaireOrAssociee = (administrationId: AdministrationId, props: 'gestionnaire' | 'associee', titreTypeId?: TitreTypeId): boolean => {
  const administrationTitresTypes = getTitreTypeIdsByAdministration(administrationId)

  if (!administrationTitresTypes.length) {
    return false
  }

  if (!titreTypeId) {
    return administrationTitresTypes.some(att => att[props])
  }

  return administrationTitresTypes.some(att => att.titreTypeId === titreTypeId && att[props])
}

export const getGestionnairesByTitreTypeId = (titreTypeId: TitreTypeId): { administrationId: AdministrationId; associee: boolean }[] => {
  return IDS.reduce<{ administrationId: AdministrationId; associee: boolean }[]>((acc, administrationId) => {
    const titreType = getTitreTypeIdsByAdministration(administrationId).find(titreType => titreType.titreTypeId === titreTypeId && titreType.gestionnaire)
    if (titreType) {
      acc.push({ associee: titreType.associee, administrationId })
    }

    return acc
  }, [])
}
