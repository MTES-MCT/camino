import { EtapeTypeId } from '../static/etapesTypes'
import { TitreTypeId } from '../static/titresTypes'
import { DemarcheTypeId, isDemarcheTypeWithPhase } from '../static/demarchesTypes'

export const dureeOptionalCheck = (etapeTypeId: EtapeTypeId, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  if (titreTypeId !== 'axm' && titreTypeId !== 'arm') {
    return true
  }

  if (!isDemarcheTypeWithPhase(demarcheTypeId)) {
    return true
  }

  return etapeTypeId !== 'mfr'
}
