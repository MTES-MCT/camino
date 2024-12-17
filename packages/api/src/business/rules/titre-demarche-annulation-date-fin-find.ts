import { CaminoDate } from 'camino-common/src/date'

import { titreEtapesSortAscByOrdre, titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort'
import { TitreDemarchePhaseFindWithEtapes, TitreEtapePhaseFind } from './titre-phases-find'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { machineFind } from '../rules-demarches/machines'
import { demarcheEnregistrementDemandeDateFind } from 'camino-common/src/demarche'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { toMachineEtapes } from '../rules-demarches/machine-common'
import { demarcheStatutIdsSuccess } from 'camino-common/src/static/demarchesStatuts'

export const titreDemarcheAnnulationDateFinFind = (titreTypeId: TitreTypeId, demarche: Omit<TitreDemarchePhaseFindWithEtapes, 'fullEtapes'>): CaminoDate | null | undefined => {
  const machine = machineFind(titreTypeId, demarche.typeId, demarche.id, demarcheEnregistrementDemandeDateFind(demarche.etapes))
  if (isNotNullNorUndefined(machine)) {
    const statut = machine.demarcheStatut(toMachineEtapes(demarche.etapes))

    if (demarcheStatutIdsSuccess.has(statut.demarcheStatut)) {
      if ('demarcheDateEffet' in statut) {
        return statut.demarcheDateEffet
      }
      throw new Error(`Pas de date d'effet trouvée pour la démarche d'annulation https://camino.beta.gouv.fr/demarches/${demarche.id}`)
    }
    return null
  } else {
    // TODO 2025-01-06 à virer quand on supprime TDE
    // si l’étape valide l’annulation
    const etapeAnnulationValideCheck = (te: TitreEtapePhaseFind) =>
      ETAPES_TYPES.decisionDeLAutoriteAdministrative === te.typeId ||
      // si l’ARM a une signature de l’avenant à l’autorisation de recherche minière fait
      (te.typeId === ETAPES_TYPES.avenantALautorisationDeRechercheMiniere && te.statutId === ETAPES_STATUTS.FAIT)

    // la dernière étape qui valide l’annulation et qui contient une date de fin
    const etapeAnnulationHasDateFin = titreEtapesSortDescByOrdre(demarche.etapes).find(te => isNotNullNorUndefined(te.dateFin) && etapeAnnulationValideCheck(te))

    // si la démarche contient une date de fin
    if (etapeAnnulationHasDateFin) {
      return etapeAnnulationHasDateFin.dateFin
    }

    // sinon,
    // trouve la première étape qui valide l’annulation
    const etapeAnnulation = titreEtapesSortAscByOrdre(demarche.etapes).find(etapeAnnulationValideCheck)

    // la date de fin est la date de l'étape
    return etapeAnnulation?.date ?? null
  }
}
