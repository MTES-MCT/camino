import { DeepReadonly } from '../../typescript-tools.js'
import { DEMARCHES_TYPES_IDS } from '../demarchesTypes.js'
import { DOCUMENTS_TYPES_IDS } from '../documentsTypes.js'
import { DOMAINES_IDS } from '../domaines.js'
import { ETAPES_TYPES } from '../etapesTypes.js'
import { SDOMZoneId, SDOMZoneIds } from '../sdom.js'
import { toTitreTypeId } from '../titresTypes.js'
import { TITRES_TYPES_TYPES_IDS } from '../titresTypesTypes.js'

type DocumentTypeIdsBySdomZonesGet = 'nir' | 'jeg' | 'nip'
export const documentTypeIdsBySdomZonesGet = (sdomZones: DeepReadonly<SDOMZoneId[]>, titreTypeId: string, demarcheTypeId: string, etapeTypeId: string): DocumentTypeIdsBySdomZonesGet[] => {
  const documentTypeIds: DocumentTypeIdsBySdomZonesGet[] = []

  // Pour les demandes d’octroi d’AXM
  if (
    sdomZones.length > 0 &&
    etapeTypeId === ETAPES_TYPES.demande &&
    demarcheTypeId === DEMARCHES_TYPES_IDS.Octroi &&
    titreTypeId === toTitreTypeId(TITRES_TYPES_TYPES_IDS.AUTORISATION_D_EXPLOITATION, DOMAINES_IDS.METAUX)
  ) {
    if (sdomZones?.find(id => id === SDOMZoneIds.Zone2)) {
      // dans la zone 2 du SDOM les documents suivants sont obligatoires:
      documentTypeIds.push(DOCUMENTS_TYPES_IDS.noticeDImpactRenforcee)
      documentTypeIds.push(DOCUMENTS_TYPES_IDS.justificationDExistenceDuGisement)
    } else {
      documentTypeIds.push(DOCUMENTS_TYPES_IDS.noticeDImpact)
    }
  }

  return documentTypeIds
}
