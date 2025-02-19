import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { ITitreDemarche } from '../../types'

import { titreDemarcheSortAsc } from '../utils/titre-elements-sort-asc'
import { titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort'
import { isDemarcheTypeOctroi } from 'camino-common/src/static/demarchesTypes'
import { CaminoDate } from 'camino-common/src/date'
import { isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
const etapeTypeIds: EtapeTypeId[] = [
  ETAPES_TYPES.publicationDeDecisionAuJORF,
  ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs,
  ETAPES_TYPES.decisionDeLAutoriteAdministrative,
  ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
  ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere,
  ETAPES_TYPES.avenantALautorisationDeRechercheMiniere,
]
const titreDemarcheOctroiDateDebutFind = (titreDemarches?: ITitreDemarche[] | null): CaminoDate | '0000' => {
  if (isNullOrUndefinedOrEmpty(titreDemarches)) {
    return '0000'
  }

  // récupère la démarche d'octroi (naturelle ou virtuelle)
  const demarcheOctroi = titreDemarcheSortAsc(titreDemarches).find(({ typeId }) => isDemarcheTypeOctroi(typeId))

  if (!demarcheOctroi || !demarcheOctroi.etapes || !demarcheOctroi.etapes.length) {
    return '0000'
  }

  // trie les étapes dans l'ordre décroissant
  const etapes = titreEtapesSortDescByOrdre(demarcheOctroi.etapes)

  // récupère l'étape la plus importante de l'octroi en premier
  const etapeOctroi =
    etapes.find(({ typeId }) => (etapeTypeIds.includes(typeId) && demarcheOctroi.statutId === 'acc') || typeId === 'mfr') ||
    // sinon utilise la première étape (chronologique) de l'octroi
    etapes[etapes.length - 1]

  return etapeOctroi.dateDebut || etapeOctroi.date
}

export default titreDemarcheOctroiDateDebutFind
