import { ITitreEtape } from '../../types'
import { titreDemarcheAnnulationDateFinFind } from './titre-demarche-annulation-date-fin-find'
import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { newDemarcheId, newEtapeId } from '../../database/models/_format/id-create'
import { toCaminoDate } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
describe("date de fin d'une démarche d'annulation", () => {
  test.each<{ typeId: EtapeTypeId; statutId: EtapeStatutId }>([
    { typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.ACCEPTE },
    { typeId: ETAPES_TYPES.publicationDeDecisionAuJORF, statutId: ETAPES_STATUTS.FAIT },
  ])("retourne la date d'une démarche d'annulation si elle n'a pas de date de fin pour une $typeId", etape => {
    const titreDemarcheId = newDemarcheId('h-cx-courdemanges-1988-ret01')
    const titreDemarcheAnnulationEtapes = [
      {
        id: newEtapeId('h-cx-courdemanges-1988-ret01-dex01'),
        titreDemarcheId,
        ...etape,
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 1,
        date: toCaminoDate('1999-05-21'),
        concurrence: { amIFirst: true },
        hasTitreFrom: true,
        demarcheIdsConsentement: [],
      },
    ] as const satisfies ITitreEtape[]
    expect(
      titreDemarcheAnnulationDateFinFind(TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE, {
        id: titreDemarcheId,
        titreId: titreIdValidator.parse('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Retrait,
        etapes: titreDemarcheAnnulationEtapes,
      })
    ).toEqual('1999-05-21')
  })
  // TODO 2025-01-15 cet id est ignoré explicitement dans la machine pour utiliser TDE, test à virer quand on arrête de faire des avenant dans les octrois mais qu'on fait des prolongations (tache à POH)
  const titreDemarcheIdExcluDesOctroisDArm = newDemarcheId('QauHUIPuv1a5neW3JqVEWh8n')

  test.each<{ typeId: EtapeTypeId; statutId: EtapeStatutId }>([
    { typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.ACCEPTE },
  ])("retourne la date de fin d'une démarche d'annulation si elle existe pour une $typeId", etape => {
    const titreDemarcheId = newDemarcheId('demarcheIdRetrait')
    const titreDemarcheAnnulationEtapesDateFin: NonEmptyArray<ITitreEtape> = [
      {
        id: newEtapeId('etapeId'),
        titreDemarcheId,
        ...etape,
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 1,
        date: toCaminoDate('1999-05-21'),
        dateFin: toCaminoDate('2013-05-25'),
        concurrence: { amIFirst: true },
        hasTitreFrom: true,
        demarcheIdsConsentement: [],
      },
    ]
    expect(
      titreDemarcheAnnulationDateFinFind(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, {
        id: titreDemarcheId,
        titreId: titreIdValidator.parse('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        etapes: titreDemarcheAnnulationEtapesDateFin,
      })
    ).toEqual('2013-05-25')
  })

  test("retourne la date de fin d'un Avenant à l'autorisation de recherche minière si elle existe", () => {
    const titreDemarcheACOFaitEtapesDateFin: NonEmptyArray<ITitreEtape> = [
      {
        id: newEtapeId('h-cx-courdemanges-1988-ret01-dex01'),
        titreDemarcheId: titreDemarcheIdExcluDesOctroisDArm,
        typeId: ETAPES_TYPES.avenantALautorisationDeRechercheMiniere,
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 1,
        date: toCaminoDate('2013-05-21'),
        dateFin: toCaminoDate('2013-05-25'),
        concurrence: 'non-applicable',
        hasTitreFrom: 'non-applicable',
        demarcheIdsConsentement: [],
      },
    ]
    expect(
      titreDemarcheAnnulationDateFinFind(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, {
        id: titreDemarcheIdExcluDesOctroisDArm,
        titreId: titreIdValidator.parse('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        etapes: titreDemarcheACOFaitEtapesDateFin,
      })
    ).toEqual('2013-05-25')
  })
})
