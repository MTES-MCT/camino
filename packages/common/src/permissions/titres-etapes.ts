import { EtapeTypeId } from '../static/etapesTypes'
import { TitreTypeId } from '../static/titresTypes'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from '../static/demarchesTypes'

export const isDemarcheTypeOctroi = (demarcheTypeId: DemarcheTypeId): boolean => {
  const demarchesTypesOctroi: DemarcheTypeId[] = [DEMARCHES_TYPES_IDS.Octroi, DEMARCHES_TYPES_IDS.MutationPartielle, DEMARCHES_TYPES_IDS.Fusion, DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation]

  return demarchesTypesOctroi.includes(demarcheTypeId)
}

export const isDemarcheTypeWithPhase = (demarcheTypeId: DemarcheTypeId): boolean => {
  if (isDemarcheTypeOctroi(demarcheTypeId)) {
    return true
  }
  const demarchesTypesWithPhases: DemarcheTypeId[] = [
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.ProlongationExceptionnelle
  ]

  return demarchesTypesWithPhases.includes(demarcheTypeId)
}

export const dureeOptionalCheck = (etapeTypeId: EtapeTypeId, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  if (titreTypeId !== 'axm' && titreTypeId !== 'arm') {
    return true
  }

  if (!isDemarcheTypeWithPhase(demarcheTypeId)) {
    return true
  }

  return etapeTypeId !== 'mfr'
}
