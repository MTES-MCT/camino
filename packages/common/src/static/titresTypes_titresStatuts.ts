import { isNotNullNorUndefined, getKeys } from '../typescript-tools.js'
import { DemarcheTypeId } from './demarchesTypes.js'
import { TitresStatutIds, TitreStatutId } from './titresStatuts.js'
import { TITRES_TYPES_IDS, TitreTypeId, isTitreType } from './titresTypes.js'

export const titrePublicFind = (
  titreStatutId: TitreStatutId | null | undefined,
  titreTypeId: TitreTypeId | undefined,
  titreDemarches: { typeId: DemarcheTypeId; publicLecture?: boolean | undefined | null }[]
): boolean => {
  if (!titreStatutId || !titreTypeId) {
    return false
  }

  // si le type de titre associé au domaine associé au statut du titre est public
  // et qu’une démarche est publique
  // alors le titre est public
  if (isTitrePublicLecture(titreTypeId, titreStatutId)) {
    const titreDemarcheOctroi = titreDemarches.find(d => d.publicLecture)

    if (titreDemarcheOctroi) {
      return true
    }
  }

  return false
}

const isTitrePublicLecture = (titreTypeId: TitreTypeId, titreStatutId: TitreStatutId): boolean => {
  return titresPublicLecture[titreTypeId]?.includes(titreStatutId) ?? false
}

const titresPublicLecture: { [key in TitreTypeId]: TitreStatutId[] } = {
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_HYDROCARBURE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_METAUX]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_CARRIERES]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_GEOTHERMIE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: [
    TitresStatutIds.DemandeClassee,
    TitresStatutIds.DemandeInitiale,
    TitresStatutIds.Echu,
    TitresStatutIds.ModificationEnInstance,
    TitresStatutIds.SurvieProvisoire,
    TitresStatutIds.Valide,
  ],
  [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: [
    TitresStatutIds.DemandeClassee,
    TitresStatutIds.DemandeInitiale,
    TitresStatutIds.Echu,
    TitresStatutIds.ModificationEnInstance,
    TitresStatutIds.SurvieProvisoire,
    TitresStatutIds.Valide,
  ],
  [TITRES_TYPES_IDS.CONCESSION_FOSSILES]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.CONCESSION_GEOTHERMIE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.CONCESSION_METAUX]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.CONCESSION_RADIOACTIF]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Echu, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES]: [
    TitresStatutIds.DemandeInitiale,
    TitresStatutIds.Echu,
    TitresStatutIds.ModificationEnInstance,
    TitresStatutIds.SurvieProvisoire,
    TitresStatutIds.Valide,
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_FOSSILES]: [
    TitresStatutIds.DemandeInitiale,
    TitresStatutIds.Echu,
    TitresStatutIds.ModificationEnInstance,
    TitresStatutIds.SurvieProvisoire,
    TitresStatutIds.Valide,
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_HYDROCARBURE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: [
    TitresStatutIds.DemandeInitiale,
    TitresStatutIds.Echu,
    TitresStatutIds.ModificationEnInstance,
    TitresStatutIds.SurvieProvisoire,
    TitresStatutIds.Valide,
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF]: [
    TitresStatutIds.DemandeInitiale,
    TitresStatutIds.Echu,
    TitresStatutIds.ModificationEnInstance,
    TitresStatutIds.SurvieProvisoire,
    TitresStatutIds.Valide,
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN]: [
    TitresStatutIds.DemandeInitiale,
    TitresStatutIds.Echu,
    TitresStatutIds.ModificationEnInstance,
    TitresStatutIds.SurvieProvisoire,
    TitresStatutIds.Valide,
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS]: [
    TitresStatutIds.DemandeInitiale,
    TitresStatutIds.ModificationEnInstance,
    TitresStatutIds.SurvieProvisoire,
    TitresStatutIds.Valide,
  ],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GEOTHERMIE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_HYDROCARBURE]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: [
    TitresStatutIds.DemandeInitiale,
    TitresStatutIds.Echu,
    TitresStatutIds.ModificationEnInstance,
    TitresStatutIds.SurvieProvisoire,
    TitresStatutIds.Valide,
  ],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_RADIOACTIF]: [
    TitresStatutIds.DemandeInitiale,
    TitresStatutIds.Echu,
    TitresStatutIds.ModificationEnInstance,
    TitresStatutIds.SurvieProvisoire,
    TitresStatutIds.Valide,
  ],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS]: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire, TitresStatutIds.Valide],
  [TITRES_TYPES_IDS.INDETERMINE_METAUX]: [],
  [TITRES_TYPES_IDS.INDETERMINE_RADIOACTIF]: [],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_FOSSILES]: [],
}

export const titreTypesStatutsTitresPublicLecture: { titreTypeId: TitreTypeId; titreStatutId: TitreStatutId; publicLecture: boolean }[] = getKeys(titresPublicLecture, isTitreType)
  .flatMap(keyType => titresPublicLecture[keyType].map(statut => ({ titreTypeId: keyType, titreStatutId: statut, publicLecture: true })))
  .filter(isNotNullNorUndefined)
