import { AdministrationId, ADMINISTRATION_IDS } from './administrations.js'
import { TitresStatutIds, TitreStatutId } from './titresStatuts.js'
import { TITRES_TYPES_IDS, TitreTypeId } from './titresTypes.js'

// TODO 2023-01-24: à supprimer le jour où on supprime la table administrations--titres-types--titres-statuts
export const toDbATT = () => {
  return Object.keys(AdministrationsTitresTypesTitresStatuts).flatMap(administrationId => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Object.keys(AdministrationsTitresTypesTitresStatuts[administrationId]).flatMap(titreTypeId =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Object.keys(AdministrationsTitresTypesTitresStatuts[administrationId][titreTypeId]).flatMap(titreStatutId => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const value = AdministrationsTitresTypesTitresStatuts[administrationId][titreTypeId][titreStatutId]

          return {
            administration_id: administrationId,
            titre_type_id: titreTypeId,
            titre_statut_id: titreStatutId,
            titres_modification_interdit: value.titresModificationInterdit,
            demarches_modification_interdit: value.demarchesModificationInterdit,
            etapes_modification_interdit: value.etapesModificationInterdit
          }
        })
      )
    )
  })
}

export const canAdministrationModifyEtapes = (administrationId: AdministrationId, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId): boolean => {
  return !restrictions(administrationId, titreTypeId, titreStatutId).etapesModificationInterdit
}
export const canAdministrationModifyDemarches = (administrationId: AdministrationId, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId): boolean => {
  return !restrictions(administrationId, titreTypeId, titreStatutId).demarchesModificationInterdit
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
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    },
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    }
  },
  [ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']]: {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    }
  },
  [ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON']]: {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    }
  },
  [ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ']]: {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    }
  },
  [ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE']]: {
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    }
  },
  [ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']]: {
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    },
    [TITRES_TYPES_IDS.CONCESSION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    },
    [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    },
    [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    }
  },
  [ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']]: {
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    }
  }
}
