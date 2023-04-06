import { CaminoAnnee, toCaminoAnnee } from 'camino-common/src/date.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes.js'
import { DepartementId } from 'camino-common/src/static/departement.js'
import { DOMAINES_IDS } from 'camino-common/src/static/domaines.js'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import { toTitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes.js'
import { AnneeCountStatistique, anneeCountStatistiqueValidator, EvolutionTitres } from 'camino-common/src/statistiques.js'
import { getDepotDb, getEtapesTypesDecisionRefusDb, getOctroiDb, getSurfaceDb } from './evolution-titres.queries.js'
import type { Pool } from 'pg'
import { dbQueryAndValidate } from '../../../pg-database.js'

export const evolutionTitres = async (pool: Pool, titreTypeTypeId: TitreTypeTypeId, departements: DepartementId[], anneeDepart = 2017): Promise<EvolutionTitres> => {
  let currentYear = new Date().getFullYear()
  const annee: Record<CaminoAnnee, number> = {}
  while (currentYear >= anneeDepart) {
    annee[toCaminoAnnee(currentYear)] = 0
    currentYear--
  }
  const demarcheOctroiTypeIds = [DEMARCHES_TYPES_IDS.Octroi, DEMARCHES_TYPES_IDS.Prolongation, DEMARCHES_TYPES_IDS.Prolongation1, DEMARCHES_TYPES_IDS.Prolongation2]
  const titreTypeId = toTitreTypeId(titreTypeTypeId, DOMAINES_IDS.METAUX)
  const etapesTypesDecisionRefus = [ETAPES_TYPES.decisionImplicite, ETAPES_TYPES.decisionDeLadministration, ETAPES_TYPES.decisionDuJugeAdministratif]
  // conversion 1 km² = 100 ha

  const [depot, octroi, refus, surface] = await Promise.all([
    dbQueryAndValidate(
      getDepotDb,
      {
        anneeDepart,
        demarcheTypeIds: demarcheOctroiTypeIds,
        departements,
        etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
        titreTypeId,
      },
      pool,
      anneeCountStatistiqueValidator
    ),
    dbQueryAndValidate(
      getOctroiDb,
      {
        anneeDepart,
        demarcheTypeIds: demarcheOctroiTypeIds,
        departements,
        titreTypeId,
      },
      pool,
      anneeCountStatistiqueValidator
    ),
    dbQueryAndValidate(
      getEtapesTypesDecisionRefusDb,
      {
        anneeDepart,
        demarcheTypeIds: demarcheOctroiTypeIds,
        departements,
        demarcheStatutIds: [DemarchesStatutsIds.Rejete, DemarchesStatutsIds.ClasseSansSuite],
        etapeStatutFait: ETAPES_STATUTS.FAIT,
        etapeStatutRejet: ETAPES_STATUTS.REJETE,
        etapesTypesDecisionRefus,
        etapeTypeClassementSansSuite: ETAPES_TYPES.classementSansSuite,
        titreTypeId,
      },
      pool,
      anneeCountStatistiqueValidator
    ),
    dbQueryAndValidate(getSurfaceDb, { anneeDepart, demarcheTypeIds: demarcheOctroiTypeIds, departements, titreTypeId }, pool, anneeCountStatistiqueValidator),
  ])

  return {
    depot: { ...annee, ...toRecord(depot) },
    octroiEtProlongation: { ...annee, ...toRecord(octroi) },
    refusees: { ...annee, ...toRecord(refus) },
    surface: { ...annee, ...toRecord(surface) },
  }
}

const toRecord = (values: AnneeCountStatistique[]): Record<CaminoAnnee, number> => {
  return values.reduce<Record<CaminoAnnee, number>>((acc, { annee, count }) => {
    acc[annee] = count

    return acc
  }, {})
}
