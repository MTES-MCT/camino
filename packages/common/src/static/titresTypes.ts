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
  apc: { id: 'apc', domaineId: 'c', typeId: 'ap' },
  aph: { id: 'aph', domaineId: 'h', typeId: 'ap' },
  apm: { id: 'apm', domaineId: 'm', typeId: 'ap' },
  apw: { id: 'apw', domaineId: 'w', typeId: 'ap' },
  arc: { id: 'arc', domaineId: 'c', typeId: 'ar' },
  arg: { id: 'arg', domaineId: 'g', typeId: 'ar' },
  arm: { id: 'arm', domaineId: 'm', typeId: 'ar' },
  axm: { id: 'axm', domaineId: 'm', typeId: 'ax' },
  cxf: { id: 'cxf', domaineId: 'f', typeId: 'cx' },
  cxg: { id: 'cxg', domaineId: 'g', typeId: 'cx' },
  cxh: { id: 'cxh', domaineId: 'h', typeId: 'cx' },
  cxm: { id: 'cxm', domaineId: 'm', typeId: 'cx' },
  cxr: { id: 'cxr', domaineId: 'r', typeId: 'cx' },
  cxs: { id: 'cxs', domaineId: 's', typeId: 'cx' },
  cxw: { id: 'cxw', domaineId: 'w', typeId: 'cx' },
  inm: { id: 'inm', domaineId: 'm', typeId: 'in' },
  inr: { id: 'inr', domaineId: 'r', typeId: 'in' },
  pcc: { id: 'pcc', domaineId: 'c', typeId: 'pc' },
  prf: { id: 'prf', domaineId: 'f', typeId: 'pr' },
  prg: { id: 'prg', domaineId: 'g', typeId: 'pr' },
  prh: { id: 'prh', domaineId: 'h', typeId: 'pr' },
  prm: { id: 'prm', domaineId: 'm', typeId: 'pr' },
  prr: { id: 'prr', domaineId: 'r', typeId: 'pr' },
  prs: { id: 'prs', domaineId: 's', typeId: 'pr' },
  prw: { id: 'prw', domaineId: 'w', typeId: 'pr' },
  pxf: { id: 'pxf', domaineId: 'f', typeId: 'px' },
  pxg: { id: 'pxg', domaineId: 'g', typeId: 'px' },
  pxh: { id: 'pxh', domaineId: 'h', typeId: 'px' },
  pxm: { id: 'pxm', domaineId: 'm', typeId: 'px' },
  pxr: { id: 'pxr', domaineId: 'r', typeId: 'px' },
  pxw: { id: 'pxw', domaineId: 'w', typeId: 'px' }
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
