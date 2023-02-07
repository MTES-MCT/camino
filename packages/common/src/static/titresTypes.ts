import { DomaineId, isDomaineId } from './domaines.js'
import { isTitreTypeType, TitreTypeTypeId } from './titresTypesTypes.js'

interface Definition<T> {
  id: T
  domaineId: DomaineId
  typeId: TitreTypeTypeId
}

export const TITRES_TYPES_IDS = {
  AUTORISATION_DE_PROSPECTION_CARRIERES: 'apc',
  AUTORISATION_DE_PROSPECTION_HYDROCARBURE: 'aph',
  AUTORISATION_DE_PROSPECTION_METAUX: 'apm',
  AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS: 'apw',

  AUTORISATION_DE_RECHERCHE_CARRIERES: 'arc',
  AUTORISATION_DE_RECHERCHE_GEOTHERMIE: 'arg',
  AUTORISATION_DE_RECHERCHE_METAUX: 'arm',

  AUTORISATION_D_EXPLOITATION_METAUX: 'axm',

  CONCESSION_FOSSILES: 'cxf',
  CONCESSION_GEOTHERMIE: 'cxg',
  CONCESSION_HYDROCARBURE: 'cxh',
  CONCESSION_METAUX: 'cxm',
  CONCESSION_RADIOACTIF: 'cxr',
  CONCESSION_SOUTERRAIN: 'cxs',
  CONCESSION_GRANULATS_MARINS: 'cxw',
  INDETERMINE_METAUX: 'inm',
  INDETERMINE_RADIOACTIF: 'inr',
  PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES: 'pcc',

  PERMIS_EXCLUSIF_DE_RECHERCHES_FOSSILES: 'prf',
  PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE: 'prg',
  PERMIS_EXCLUSIF_DE_RECHERCHES_HYDROCARBURE: 'prh',
  PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX: 'prm',
  PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF: 'prr',
  PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN: 'prs',
  PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS: 'prw',

  PERMIS_D_EXPLOITATION_FOSSILES: 'pxf',
  PERMIS_D_EXPLOITATION_GEOTHERMIE: 'pxg',
  PERMIS_D_EXPLOITATION_HYDROCARBURE: 'pxh',
  PERMIS_D_EXPLOITATION_METAUX: 'pxm',
  PERMIS_D_EXPLOITATION_RADIOACTIF: 'pxr',
  PERMIS_D_EXPLOITATION_GRANULATS_MARINS: 'pxw'
} as const

export const TitresTypesIds = Object.values(TITRES_TYPES_IDS)

export type TitreTypeId = typeof TITRES_TYPES_IDS[keyof typeof TITRES_TYPES_IDS]

export const TitresTypes: {
  [key in TitreTypeId]: Definition<key>
} = {
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES]: { id: 'apc', domaineId: 'c', typeId: 'ap' },
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_HYDROCARBURE]: { id: 'aph', domaineId: 'h', typeId: 'ap' },
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_METAUX]: { id: 'apm', domaineId: 'm', typeId: 'ap' },
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS]: { id: 'apw', domaineId: 'w', typeId: 'ap' },
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_CARRIERES]: { id: 'arc', domaineId: 'c', typeId: 'ar' },
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_GEOTHERMIE]: { id: 'arg', domaineId: 'g', typeId: 'ar' },
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: { id: 'arm', domaineId: 'm', typeId: 'ar' },
  [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: { id: 'axm', domaineId: 'm', typeId: 'ax' },
  [TITRES_TYPES_IDS.CONCESSION_FOSSILES]: { id: 'cxf', domaineId: 'f', typeId: 'cx' },
  [TITRES_TYPES_IDS.CONCESSION_GEOTHERMIE]: { id: 'cxg', domaineId: 'g', typeId: 'cx' },
  [TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE]: { id: 'cxh', domaineId: 'h', typeId: 'cx' },
  [TITRES_TYPES_IDS.CONCESSION_METAUX]: { id: 'cxm', domaineId: 'm', typeId: 'cx' },
  [TITRES_TYPES_IDS.CONCESSION_RADIOACTIF]: { id: 'cxr', domaineId: 'r', typeId: 'cx' },
  [TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN]: { id: 'cxs', domaineId: 's', typeId: 'cx' },
  [TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS]: { id: 'cxw', domaineId: 'w', typeId: 'cx' },
  [TITRES_TYPES_IDS.INDETERMINE_METAUX]: { id: 'inm', domaineId: 'm', typeId: 'in' },
  [TITRES_TYPES_IDS.INDETERMINE_RADIOACTIF]: { id: 'inr', domaineId: 'r', typeId: 'in' },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES]: { id: 'pcc', domaineId: 'c', typeId: 'pc' },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_FOSSILES]: { id: 'prf', domaineId: 'f', typeId: 'pr' },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE]: { id: 'prg', domaineId: 'g', typeId: 'pr' },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_HYDROCARBURE]: { id: 'prh', domaineId: 'h', typeId: 'pr' },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: { id: 'prm', domaineId: 'm', typeId: 'pr' },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF]: { id: 'prr', domaineId: 'r', typeId: 'pr' },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN]: { id: 'prs', domaineId: 's', typeId: 'pr' },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS]: { id: 'prw', domaineId: 'w', typeId: 'pr' },
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_FOSSILES]: { id: 'pxf', domaineId: 'f', typeId: 'px' },
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GEOTHERMIE]: { id: 'pxg', domaineId: 'g', typeId: 'px' },
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_HYDROCARBURE]: { id: 'pxh', domaineId: 'h', typeId: 'px' },
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: { id: 'pxm', domaineId: 'm', typeId: 'px' },
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_RADIOACTIF]: { id: 'pxr', domaineId: 'r', typeId: 'px' },
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS]: { id: 'pxw', domaineId: 'w', typeId: 'px' }
} as const

export const isTitreType = (titreType: string | undefined | null): titreType is TitreTypeId => TitresTypesIds.includes(titreType)

export const toTitreTypeId = (titreTypeType: TitreTypeTypeId, domaineId: DomaineId): TitreTypeId => {
  const titreTypeId = `${titreTypeType}${domaineId}`
  if (!isTitreType(titreTypeId)) {
    throw new Error(`le titre type ${titreTypeId} n'est pas reconnu par Camino`)
  }

  return titreTypeId
}

export const getTitreTypeType = (titreType: TitreTypeId): TitreTypeTypeId => {
  const titreTypeType = titreType.substring(0, 2)
  if (isTitreTypeType(titreTypeType)) {
    return titreTypeType
  } else {
    throw new Error(`le titreType ${titreType} n'a pas de titreTypeType connu, cas impossible`)
  }
}

export const getDomaineId = (titreType: TitreTypeId): DomaineId => {
  const domaineId = titreType.substring(2, 3)
  if (isDomaineId(domaineId)) {
    return domaineId
  } else {
    throw new Error(`le titreType ${titreType} n'a pas de domaineId connu, cas impossible`)
  }
}

export const getTitreTypeTypeByDomaineId = (domaineId: DomaineId): TitreTypeTypeId[] =>
  Object.values(TitresTypes)
    .filter(v => v.domaineId === domaineId)
    .map(({ typeId }) => typeId)
