import { EtapeTypeId } from '../static/etapesTypes'
import { TitreTypeId } from '../static/titresTypes'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from '../static/demarchesTypes'

export const demarchesTypesOctroi = [DEMARCHES_TYPES_IDS.Octroi, DEMARCHES_TYPES_IDS.MutationPartielle, DEMARCHES_TYPES_IDS.Fusion] as const

export const demarchesTypesWithPhases: DemarcheTypeId[] = [...demarchesTypesOctroi, 'pro', 'pr1', 'pr2', 'pre', 'vct']

export const dureeOptionalCheck = (etapeTypeId: EtapeTypeId, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  if (titreTypeId !== 'axm' && titreTypeId !== 'arm') {
    return true
  }

  if (!demarchesTypesWithPhases.includes(demarcheTypeId)) {
    return true
  }

  return etapeTypeId !== 'mfr'
}
