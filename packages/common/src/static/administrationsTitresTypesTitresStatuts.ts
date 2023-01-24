import { AdministrationId, ADMINISTRATION_IDS } from './administrations.js'
import { TitresStatutIds, TitreStatutId } from './titresStatuts.js'
import { TitreTypeId } from './titresTypes.js'

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

export const canAdministrationModifyTitreStatutId = (administrationId: AdministrationId, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId): boolean => {
  return !restrictions(administrationId, titreTypeId, titreStatutId).etapesModificationInterdit
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
    arm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    },
    cxm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    },
    pxm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    }
  },
  [ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']]: {
    cxm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    },
    prm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    }
  },
  [ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON']]: {
    cxm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    },
    prm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    }
  },
  [ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ']]: {
    cxm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    },
    prm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    }
  },
  [ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE']]: {
    cxm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    },
    prm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: false }
    }
  },
  [ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']]: {
    axm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    },
    cxm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    },
    prm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    },
    pxm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.DemandeInitiale]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Indetermine]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.ModificationEnInstance]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Valide]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    }
  },
  [ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']]: {
    arm: {
      [TitresStatutIds.DemandeClassee]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true },
      [TitresStatutIds.Echu]: { titresModificationInterdit: true, demarchesModificationInterdit: true, etapesModificationInterdit: true }
    }
  }
}
