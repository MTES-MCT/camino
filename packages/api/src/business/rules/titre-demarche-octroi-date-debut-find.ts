import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { ITitreDemarche } from '../../types.js'

import { titreDemarcheSortAsc } from '../utils/titre-elements-sort-asc.js'
import { titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort.js'
import { isDemarcheTypeOctroi } from 'camino-common/src/static/demarchesTypes.js'
const etapeTypeIds: EtapeTypeId[] = ['dpu', 'dup', 'rpu', 'dex', 'dux', 'dim', 'def', 'sco', 'aco']
const titreDemarcheOctroiDateDebutFind = (titreDemarches?: ITitreDemarche[] | null) => {
  if (!titreDemarches || !titreDemarches.length) return '0000'

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
