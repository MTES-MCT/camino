import { isNotNullNorUndefined } from '../typescript-tools'
import { DemarcheTypeId, isDemarcheTypeOctroi } from './demarchesTypes'
import { DomaineId, DOMAINES_IDS, isDomaineId } from './domaines'
import { TitresStatutIds, TitreStatutId } from './titresStatuts'
import { TitreTypeId, toTitreTypeId } from './titresTypes'
import { TITRES_TYPES_TYPES_IDS, TitreTypeTypeId, isTitreTypeType } from './titresTypesTypes'

export const titrePublicFind = (
  titreStatutId: TitreStatutId | null | undefined,
  titreTypeTypeId: TitreTypeTypeId | undefined,
  domaineId: DomaineId | undefined,
  titreDemarches: { typeId: DemarcheTypeId; publicLecture?: boolean | undefined | null }[]
) => {
  const entreprisesLecture = true
  let publicLecture = false
  if (!titreStatutId || !titreTypeTypeId || !domaineId) {
    return { publicLecture, entreprisesLecture }
  }

  // si le type de titre associé au domaine associé au statut du titre est public
  // et la démarche d'octroi (virtuelle ou non) est publique
  // alors le titre est public
  if (isTitrePublicLecture(titreTypeTypeId, domaineId, titreStatutId)) {
    const titreDemarcheOctroi = titreDemarches.find(d => isDemarcheTypeOctroi(d.typeId) && d.publicLecture)

    if (titreDemarcheOctroi) {
      publicLecture = true
    }
  }

  return { publicLecture, entreprisesLecture }
}

const isTitrePublicLecture = (titreTypeType: TitreTypeTypeId, domaineId: DomaineId, titreStatutId: TitreStatutId): boolean => {
  return titresPublicLecture[titreTypeType]?.[domaineId]?.includes(titreStatutId) ?? false
}

const titresPublicLecture: { [key in TitreTypeTypeId]?: { [key in DomaineId]?: TitreStatutId[] } } = {
  [TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_PROSPECTION]: {
    [DOMAINES_IDS.CARRIERES]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.HYDROCARBURE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.METAUX]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.GRANULATS_MARINS]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide]
  },
  [TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE]: {
    [DOMAINES_IDS.CARRIERES]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.GEOTHERMIE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.METAUX]: [TitresStatutIds.DemandeClassee, TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide]
  },
  [TITRES_TYPES_TYPES_IDS.AUTORISATION_D_EXPLOITATION]: {
    [DOMAINES_IDS.METAUX]: [TitresStatutIds.DemandeClassee, TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide]
  },
  [TITRES_TYPES_TYPES_IDS.CONCESSION]: {
    [DOMAINES_IDS.FOSSILES]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.GEOTHERMIE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.HYDROCARBURE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.METAUX]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.RADIOACTIF]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.SOUTERRAIN]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.GRANULATS_MARINS]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide]
  },
  [TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES]: {
    [DOMAINES_IDS.CARRIERES]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide]
  },
  [TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES]: {
    [DOMAINES_IDS.FOSSILES]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.GEOTHERMIE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.HYDROCARBURE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.METAUX]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.RADIOACTIF]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.SOUTERRAIN]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.GRANULATS_MARINS]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide]
  },
  [TITRES_TYPES_TYPES_IDS.PERMIS_D_EXPLOITATION]: {
    [DOMAINES_IDS.GEOTHERMIE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.HYDROCARBURE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.METAUX]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.RADIOACTIF]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide],
    [DOMAINES_IDS.GRANULATS_MARINS]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.Valide]
  }
}

export const titreTypesStatutsTitresPublicLecture: { titreTypeId: TitreTypeId; titreStatutId: TitreStatutId; publicLecture: boolean }[] = Object.keys(titresPublicLecture)
  .filter(isTitreTypeType)
  .flatMap(keyType => {
    return Object.keys(titresPublicLecture[keyType] ?? [])
      .filter(isDomaineId)
      .flatMap(keyDomaine => titresPublicLecture[keyType]?.[keyDomaine]?.flatMap(statut => ({ titreTypeId: toTitreTypeId(keyType, keyDomaine), titreStatutId: statut, publicLecture: true })))
  })
  .filter(isNotNullNorUndefined)
