import { getKeys, isNotNullNorUndefined } from '../typescript-tools'
import { AdministrationId, ADMINISTRATION_IDS } from './administrations'
import { isTitreStatutId, TitresStatutIds, TitreStatutId } from './titresStatuts'
import { isTitreType, TITRES_TYPES_IDS, TitreTypeId } from './titresTypes'

export const canAdministrationModifyEtapes = (administrationId: AdministrationId, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId): boolean => {
  return !restrictions(administrationId, titreTypeId, titreStatutId).etapesModificationInterdit
}
export const canAdministrationModifyDemarches = (administrationId: AdministrationId, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId): boolean => {
  return !restrictions(administrationId, titreTypeId, titreStatutId).demarchesModificationInterdit
}
export const canAdministrationModifyTitres = (administrationId: AdministrationId, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId): boolean => {
  return !restrictions(administrationId, titreTypeId, titreStatutId).titresModificationInterdit
}

const restrictions = (
  administrationId: AdministrationId,
  titreTypeId: TitreTypeId,
  titreStatutId: TitreStatutId
): {
  titresModificationInterdit: boolean
  demarchesModificationInterdit: boolean
  etapesModificationInterdit: boolean
} => {
  const restriction = AdministrationsTitresTypesTitresStatuts[administrationId]?.[titreTypeId]?.[titreStatutId]

  if (restriction !== undefined) {
    return restriction
  }

  return { titresModificationInterdit: false, demarchesModificationInterdit: false, etapesModificationInterdit: false }
}
const AdministrationsTitresTypesTitresStatuts: {
  [key in AdministrationId]?: {
    [key in TitreTypeId]?: {
      [key in TitreStatutId]?: {
        titresModificationInterdit: boolean
        demarchesModificationInterdit: boolean
        etapesModificationInterdit: boolean
      }
    }
  }
} = {
  [ADMINISTRATION_IDS['DGTM - GUYANE']]: {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
    },
  },
  [ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']]: {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
    },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
    },
  },
  [ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON']]: {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
    },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
    },
  },
  [ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ']]: {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
    },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
    },
  },
  [ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE']]: {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
    },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
    },
  },
  [ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']]: {
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
    },
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
    },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
    },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.SurvieProvisoire]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
    },
  },
  [ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']]: {
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
    },
  },
}

export const getAdministrationTitresTypesTitresStatuts = (
  administrationId: AdministrationId
): { titreTypeId: TitreTypeId; titreStatutId: TitreStatutId; titresModificationInterdit: boolean; demarchesModificationInterdit: boolean; etapesModificationInterdit: boolean }[] => {
  return getKeys(AdministrationsTitresTypesTitresStatuts[administrationId] ?? {}, isTitreType)
    .flatMap(titreTypeId =>
      getKeys(AdministrationsTitresTypesTitresStatuts[administrationId]?.[titreTypeId] ?? {}, isTitreStatutId).flatMap(titreStatutId => {
        const value = AdministrationsTitresTypesTitresStatuts[administrationId]?.[titreTypeId]?.[titreStatutId]

        return value
          ? {
              titreTypeId,
              titreStatutId,
              titresModificationInterdit: value.titresModificationInterdit,
              demarchesModificationInterdit: value.demarchesModificationInterdit,
              etapesModificationInterdit: value.etapesModificationInterdit,
            }
          : null
      })
    )
    .filter(isNotNullNorUndefined)
}
