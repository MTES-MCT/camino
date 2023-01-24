import { AdministrationId, ADMINISTRATION_IDS } from './administrations.js'
import { TitresStatutIds, TitreStatutId } from './titresStatuts.js'
import { TitreTypeId } from './titresTypes.js'

// FIXME better representation --> Map Vs array ?
export const restrictions = (
  administrationId: AdministrationId,
  titreTypeId: TitreTypeId,
  titreStatutId: TitreStatutId
): {
  titresModificationInterdit: boolean
  demarchesModificationInterdit: boolean
  etapesModificationInterdit: boolean
} => {
  const restriction = AdministrationsTitresTypesTitresStatuts.find(entry => {
    return entry.administrationId === administrationId && entry.titreTypeId === titreTypeId && entry.titreStatutId === titreStatutId
  })

  if (restriction !== undefined) {
    return restriction
  }

  return { titresModificationInterdit: false, demarchesModificationInterdit: false, etapesModificationInterdit: false }
}
const AdministrationsTitresTypesTitresStatuts: {
  administrationId: AdministrationId
  titreTypeId: TitreTypeId
  titreStatutId: TitreStatutId
  titresModificationInterdit: true
  demarchesModificationInterdit: true
  etapesModificationInterdit: boolean
}[] = [
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'cxm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'prm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.DemandeInitiale,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.Indetermine,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.ModificationEnInstance,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'pxm',
    titreStatutId: TitresStatutIds.Valide,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    titreStatutId: TitresStatutIds.DemandeClassee,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    titreStatutId: TitresStatutIds.Echu,
    titresModificationInterdit: true,
    demarchesModificationInterdit: true,
    etapesModificationInterdit: true
  }
]
