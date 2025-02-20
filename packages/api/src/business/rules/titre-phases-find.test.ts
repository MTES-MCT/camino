import { ITitreDemarche } from '../../types'
import { DemarcheId, demarcheSlugValidator } from 'camino-common/src/demarche'

import { titrePhasesFind, TitreDemarchePhaseFind } from './titre-phases-find'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { TITRES_TYPES_IDS, TitreTypeId } from 'camino-common/src/static/titresTypes'

import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON, etapeSlugValidator } from 'camino-common/src/etape'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { km2Validator } from 'camino-common/src/number'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
const titresProd = require('./titre-phases-find.cas.json') // eslint-disable-line

export type TitrePhasesTest = [TitreTypeId, TitreDemarchePhaseFind[]]
const multiPolygonWith4Points: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [1, 2],
          [1, 2],
          [1, 2],
          [1, 2],
        ],
      ],
    ],
  },
}

describe("phases d'une démarche", () => {
  test("un titre qui a une démarche d'octroi avec une dex rejeté et une dpu faites n'a  pas de phase", () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreid'),
            id: newDemarcheId('demarcheId'),
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            statutId: ETAPES_STATUTS.REJETE,
            etapes: [
              {
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                statutId: ETAPES_STATUTS.FAIT,
                ordre: 2,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2200-01-02'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('demarcheId'),
              },
              {
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                statutId: ETAPES_STATUTS.REJETE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2200-01-01'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('demarcheId'),
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF
      )
    ).toEqual({})
  })

  test("un titre qui a une démarche d'octroi avec une dpu a une phase", () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreid'),
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            statutId: ETAPES_STATUTS.ACCEPTE,
            etapes: [
              {
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 2,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2200-01-01'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
              },
              {
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2200-01-01'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE
      )
    ).toEqual({
      'h-cx-courdemanges-1988-oct01': {
        dateDebut: '2200-01-01',
        dateFin: '2202-01-01',
      },
    })
  })

  test("un titre qui a une démarche d'octroi sans dpu n'a pas de phase", () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            statutId: ETAPES_STATUTS.ACCEPTE,
            etapes: [],
          },
        ],
        TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE
      )
    ).toEqual({})
  })

  test("un titre AXM qui a une démarche d'octroi avec une dex a une phase", () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-ax-courdemanges-1988-oct01'),
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            statutId: ETAPES_STATUTS.ACCEPTE,
            etapes: [
              {
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2200-01-01'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('h-ax-courdemanges-1988-oct01'),
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX
      )
    ).toEqual({
      'h-ax-courdemanges-1988-oct01': {
        dateDebut: '2200-01-01',
        dateFin: '2202-01-01',
      },
    })
  })

  test("un titre PRM qui a une démarche d'octroi avec une rpu a une phase", () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('m-pr-courdemanges-1988-oct01'),
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            statutId: ETAPES_STATUTS.ACCEPTE,
            etapes: [
              {
                typeId: ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2200-01-02'),
                titreDemarcheId: newDemarcheId('m-pr-courdemanges-1988-oct01'),
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX
      )
    ).toEqual({
      'm-pr-courdemanges-1988-oct01': {
        dateDebut: '2200-01-01',
        dateFin: '2200-01-02',
      },
    })
  })

  test("un titre qui a une démarche d'octroi avec une dpu dont la date de début est renseignée a une phase", () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            statutId: ETAPES_STATUTS.ACCEPTE,
            etapes: [
              {
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 2,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2200-01-01'),
                dateDebut: toCaminoDate('2200-01-02'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
              },
              {
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2200-01-01'),
                dateDebut: toCaminoDate('2200-01-02'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE
      )
    ).toEqual({
      'h-cx-courdemanges-1988-oct01': {
        dateDebut: '2200-01-02',
        dateFin: '2202-01-02',
      },
    })
  })

  test('un titre qui a une démarche de prolongation avec une dpu a une phase', () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 2,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2500-01-01'),
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2500-01-01'),
              },
            ],
          },
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-pro01'),
            typeId: DEMARCHES_TYPES_IDS.Prolongation,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-pro01'),
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 2,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2300-01-02'),
                dateFin: toCaminoDate('3000-01-01'),
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-pro01'),
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2300-01-02'),
                dateFin: toCaminoDate('3000-01-01'),
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE
      )
    ).toEqual({
      'h-cx-courdemanges-1988-oct01': {
        dateDebut: '2200-01-01',
        dateFin: '2500-01-01',
      },
      'h-cx-courdemanges-1988-pro01': {
        dateDebut: '2500-01-01',
        dateFin: '3000-01-01',
      },
    })
  })

  test("la phase d'un titre concernée par une démarche d'annulation a une date de fin qui est celle de cette démarche d'annulation", () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 2,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2000-01-02'),
                duree: 20 * 12,
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2000-01-01'),
                duree: 20 * 12,
              },
            ],
          },
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-ren01'),
            typeId: DEMARCHES_TYPES_IDS.RenonciationTotale,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 2,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2019-01-03'),
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2019-01-02'),
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE
      )
    ).toEqual({
      'h-cx-courdemanges-1988-oct01': {
        dateDebut: '2000-01-02',
        dateFin: '2019-01-02',
      },
    })
  })

  test("la phase d'un titre concernée par une démarche de renonciation partielle n'est pas affectée par la renonciation", () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 2,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2000-01-02'),
                duree: 20 * 12,
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2000-01-01'),
                duree: 20 * 12,
              },
            ],
          },
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-ren01'),
            typeId: DEMARCHES_TYPES_IDS.RenonciationPartielle,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 2,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2019-01-03'),
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2019-01-02'),
                geojson4326Perimetre: multiPolygonWith4Points,
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE
      )
    ).toEqual({
      'h-cx-courdemanges-1988-oct01': {
        dateDebut: '2000-01-02',
        dateFin: '2020-01-02',
      },
    })
  })

  test('cas sans date de fin et avec plein de css', () => {
    const titreId = newTitreId('titreId')
    const demarcheId1 = newDemarcheId('demarcheId1')
    const demarcheId2 = newDemarcheId('demarcheId2')
    const demarcheId3 = newDemarcheId('demarcheId3')
    const demarcheId4 = newDemarcheId('demarcheId4')
    const demarcheId5 = newDemarcheId('demarcheId5')
    const demarcheId6 = newDemarcheId('demarcheId6')
    const demarcheId7 = newDemarcheId('demarcheId7')
    const demarcheId8 = newDemarcheId('demarcheId8')
    const demarcheId9 = newDemarcheId('demarcheId9')
    const demarcheId10 = newDemarcheId('demarcheId10')
    const demarcheId11 = newDemarcheId('demarcheId11')
    const demarches: ITitreDemarche[] = [
      {
        titreId,
        id: demarcheId1,
        ordre: 11,
        typeId: DEMARCHES_TYPES_IDS.Mutation,
        statutId: DemarchesStatutsIds.ClasseSansSuite,
        etapes: [
          {
            titreDemarcheId: demarcheId1,
            id: newEtapeId('3'),
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2016-12-28'),
            duree: 1920,
            surface: km2Validator.parse(5.51),
            typeId: ETAPES_TYPES.demande,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            titreDemarcheId: demarcheId1,
            id: newEtapeId('1'),
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2016-12-28'),
            typeId: ETAPES_TYPES.enregistrementDeLaDemande,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            titreDemarcheId: demarcheId1,
            id: newEtapeId('2'),
            ordre: 3,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2017-04-07'),
            typeId: ETAPES_TYPES.classementSansSuite,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        id: demarcheId2,
        titreId,
        ordre: 10,
        typeId: DEMARCHES_TYPES_IDS.Prolongation,
        statutId: DemarchesStatutsIds.ClasseSansSuite,
        etapes: [
          {
            titreDemarcheId: demarcheId2,
            id: newEtapeId('4'),
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2016-12-28'),
            duree: 1920,
            surface: km2Validator.parse(5.51),
            typeId: ETAPES_TYPES.demande,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            titreDemarcheId: demarcheId2,
            id: newEtapeId('5'),
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2016-12-28'),
            typeId: ETAPES_TYPES.enregistrementDeLaDemande,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            titreDemarcheId: demarcheId2,
            id: newEtapeId('6'),
            ordre: 3,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2017-04-07'),
            typeId: ETAPES_TYPES.classementSansSuite,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        titreId,
        id: demarcheId3,
        ordre: 9,
        typeId: DEMARCHES_TYPES_IDS.DeclarationDArretDefinitifDesTravaux,
        statutId: DemarchesStatutsIds.EnInstruction,
        etapes: [
          {
            id: newEtapeId('7'),
            titreDemarcheId: demarcheId3,
            ordre: 3,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2014-12-23'),
            typeId: ETAPES_TYPES.arretePrefectoralDePremierDonnerActe_DADT_,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('8'),
            titreDemarcheId: demarcheId3,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2013-08-01'),
            typeId: ETAPES_TYPES.declarationDarretDefinitifDeTravaux_DADT_,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('9'),
            titreDemarcheId: demarcheId3,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2014-08-25'),
            typeId: ETAPES_TYPES.recevabiliteDeLaDemande,
            statutId: ETAPES_STATUTS.FAVORABLE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        titreId,
        id: demarcheId4,
        ordre: 8,
        typeId: DEMARCHES_TYPES_IDS.Mutation,
        statutId: ETAPES_STATUTS.ACCEPTE,
        etapes: [
          {
            id: newEtapeId('10'),
            titreDemarcheId: demarcheId4,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2002-12-24'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            titreDemarcheId: demarcheId4,
            id: newEtapeId('11'),
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2003-01-08'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        titreId,
        id: demarcheId5,
        ordre: 7,
        typeId: DEMARCHES_TYPES_IDS.Mutation,
        statutId: ETAPES_STATUTS.ACCEPTE,
        etapes: [
          {
            id: newEtapeId('12'),
            titreDemarcheId: demarcheId5,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2000-09-26'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('13'),
            titreDemarcheId: demarcheId5,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2000-10-06'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        titreId,
        id: demarcheId6,
        ordre: 6,
        typeId: DEMARCHES_TYPES_IDS.Mutation,
        statutId: ETAPES_STATUTS.ACCEPTE,
        etapes: [
          {
            id: newEtapeId('id'),
            titreDemarcheId: demarcheId6,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1975-11-24'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('15'),
            titreDemarcheId: demarcheId6,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1975-11-27'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        titreId,
        id: demarcheId7,
        ordre: 5,
        typeId: DEMARCHES_TYPES_IDS.Mutation,

        statutId: ETAPES_STATUTS.ACCEPTE,
        etapes: [
          {
            id: newEtapeId('16'),
            titreDemarcheId: demarcheId7,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1970-11-16'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('17'),
            titreDemarcheId: demarcheId7,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1970-11-19'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        titreId,
        id: demarcheId8,
        ordre: 4,
        typeId: DEMARCHES_TYPES_IDS.Mutation,
        statutId: ETAPES_STATUTS.ACCEPTE,
        etapes: [
          {
            id: newEtapeId('18'),
            titreDemarcheId: demarcheId8,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1949-08-31'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('19'),
            titreDemarcheId: demarcheId8,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1949-08-23'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        titreId,
        id: demarcheId9,
        ordre: 3,
        typeId: DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
        statutId: ETAPES_STATUTS.ACCEPTE,
        etapes: [
          {
            id: newEtapeId('20'),
            titreDemarcheId: demarcheId9,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1889-02-27'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('21'),
            titreDemarcheId: demarcheId9,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1889-02-27'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        titreId,
        id: demarcheId10,
        ordre: 2,
        typeId: DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
        statutId: ETAPES_STATUTS.ACCEPTE,
        etapes: [
          {
            id: newEtapeId('22'),
            titreDemarcheId: demarcheId10,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1879-11-14'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('23'),
            titreDemarcheId: demarcheId10,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1879-07-26'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        titreId,
        id: demarcheId11,
        ordre: 1,
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        statutId: ETAPES_STATUTS.ACCEPTE,
        etapes: [
          {
            id: newEtapeId('24'),
            titreDemarcheId: demarcheId11,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1858-03-24'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('25'),
            titreDemarcheId: demarcheId11,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1858-03-24'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
    ]

    const tested = titrePhasesFind(demarches, TITRES_TYPES_IDS.CONCESSION_METAUX)
    expect(tested).toStrictEqual({
      [newDemarcheId('demarcheId11')]: {
        dateDebut: '1858-03-24',
        dateFin: '2018-12-31',
      },
    })
  })

  test('cas de survie provisoire avec la prolongation en classement sans suite après la fin de l’octroi', () => {
    const titreId = newTitreId('titreId')
    const demarcheIdOctroi = newDemarcheId('demarcheIdOctroi')
    const demarcheIdProlongation = newDemarcheId('demarcheIdProlongation')
    const demarches: ITitreDemarche[] = [
      {
        titreId,
        id: demarcheIdProlongation,
        ordre: 11,
        typeId: DEMARCHES_TYPES_IDS.Prolongation,
        statutId: DemarchesStatutsIds.ClasseSansSuite,
        etapes: [
          {
            titreDemarcheId: demarcheIdProlongation,
            id: newEtapeId('2'),
            ordre: 3,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2011-04-07'),
            typeId: ETAPES_TYPES.classementSansSuite,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            titreDemarcheId: demarcheIdProlongation,
            id: newEtapeId('1'),
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2008-12-28'),
            typeId: ETAPES_TYPES.enregistrementDeLaDemande,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            titreDemarcheId: demarcheIdProlongation,
            id: newEtapeId('3'),
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2008-12-28'),
            duree: 60,
            typeId: ETAPES_TYPES.demande,
            statutId: ETAPES_STATUTS.FAIT,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        titreId,
        id: demarcheIdOctroi,
        ordre: 1,
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        statutId: ETAPES_STATUTS.ACCEPTE,
        etapes: [
          {
            id: newEtapeId('24'),
            titreDemarcheId: demarcheIdOctroi,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2000-03-24'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            duree: 120,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('25'),
            titreDemarcheId: demarcheIdOctroi,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2000-03-24'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
    ]

    const tested = titrePhasesFind(demarches, TITRES_TYPES_IDS.CONCESSION_METAUX)
    expect(tested).toStrictEqual({
      [demarcheIdOctroi]: {
        dateDebut: '2000-03-24',
        dateFin: '2010-03-24',
      },
      [demarcheIdProlongation]: {
        dateDebut: '2010-03-24',
        dateFin: '2011-04-07',
      },
    })
  })

  test('un octroi rejeté ne génère pas de phase', () => {
    const titreId = newTitreId('titreId')
    const demarcheIdOctroi = newDemarcheId('demarcheIdOctroi')
    const demarches: ITitreDemarche[] = [
      {
        titreId,
        id: demarcheIdOctroi,
        ordre: 1,
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        statutId: ETAPES_STATUTS.ACCEPTE,
        etapes: [
          {
            id: newEtapeId('24'),
            titreDemarcheId: demarcheIdOctroi,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2000-03-24'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            duree: 120,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('25'),
            titreDemarcheId: demarcheIdOctroi,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2000-03-24'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.REJETE,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
    ]

    const tested = titrePhasesFind(demarches, TITRES_TYPES_IDS.CONCESSION_METAUX)
    expect(tested).toStrictEqual({})
  })

  test("modification d'une mutation suite à renonciation totale en décision implicite", () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1970-09-17'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1970-09-09'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Mutation,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 2,
        slug: demarcheSlugValidator.parse('m-cx-pontaubert-1970-mut01'),
        etapes: [
          {
            id: newEtapeId('demarcheId2EtapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1994-10-18'),
            dateFin: toCaminoDate('2044-10-18'),
            duree: 600,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId2EtapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1994-10-13'),
            duree: 600,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId3'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.RenonciationTotale,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 3,
        etapes: [
          {
            id: newEtapeId('demarcheId3etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.demande,
            statutId: ETAPES_STATUTS.FAIT,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2019-10-22'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId3etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.enregistrementDeLaDemande,
            statutId: ETAPES_STATUTS.FAIT,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2019-11-20'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId3etapeId5'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 5,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2022-05-09'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId3etapeId6'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 6,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2022-05-09'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId3etapeId3'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.rapportEtAvisDeLaDREAL,
            statutId: ETAPES_STATUTS.FAVORABLE,
            ordre: 3,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2020-05-11'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId3etapeId4'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.avisDuPrefet,
            statutId: ETAPES_STATUTS.FAVORABLE,
            ordre: 4,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2020-06-30'),
            slug: etapeSlugValidator.parse('m-cx-pontaubert-1970-ren01-app01'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
    ]
    const titreTypeId = TITRES_TYPES_IDS.CONCESSION_METAUX

    const tested = titrePhasesFind(demarches, titreTypeId)
    expect(tested).toStrictEqual({
      [newDemarcheId('demarcheId1')]: {
        dateDebut: '1970-09-17',
        dateFin: '1994-10-18',
      },
      [newDemarcheId('demarcheId2')]: {
        dateDebut: '1994-10-18',
        dateFin: '2022-05-09',
      },
    })
  })

  test("modification d'une mutation suite à renonciation totale", () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1970-09-17'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1970-09-09'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Mutation,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 2,
        etapes: [
          {
            id: newEtapeId('demarcheId2EtapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1994-10-18'),
            dateFin: toCaminoDate('2044-10-18'),
            duree: 600,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId2EtapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1994-10-13'),
            duree: 600,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId3'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.RenonciationTotale,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 3,
        etapes: [
          {
            id: newEtapeId('demarcheId3etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.demande,
            statutId: ETAPES_STATUTS.FAIT,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2019-10-22'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId3etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.enregistrementDeLaDemande,
            statutId: ETAPES_STATUTS.FAIT,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2019-11-20'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId3etapeId3'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.rapportEtAvisDeLaDREAL,
            statutId: ETAPES_STATUTS.FAVORABLE,
            ordre: 3,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2020-05-11'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId3etapeId5'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE_DECISION_IMPLICITE,
            ordre: 5,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2022-05-09'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId3etapeId4'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: ETAPES_TYPES.avisDuPrefet,
            statutId: ETAPES_STATUTS.FAVORABLE,
            ordre: 4,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2020-06-30'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
    ]
    const titreTypeId = TITRES_TYPES_IDS.CONCESSION_METAUX

    //  d'un côté on a une dim, de l'autre on a une dex suivie d'une dpu
    const tested = titrePhasesFind(demarches, titreTypeId)
    expect(tested).toStrictEqual({
      [newDemarcheId('demarcheId1')]: {
        dateDebut: '1970-09-17',
        dateFin: '1994-10-18',
      },
      [newDemarcheId('demarcheId2')]: {
        dateDebut: '1994-10-18',
        dateFin: '2022-05-09',
      },
    })
  })

  test('la phase d’une démarche d’octroi sans durée est affectée par une extension de périmètre postérieure', () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1968-01-24'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1968-01-13'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 2,
        etapes: [
          {
            id: newEtapeId('demarcheId2EtapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1981-09-13'),
            dateFin: toCaminoDate('2031-09-13'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId2EtapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('1981-09-09'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
    ]
    const titreTypeId = TITRES_TYPES_IDS.CONCESSION_METAUX

    const tested = titrePhasesFind(demarches, titreTypeId)
    expect(tested).toStrictEqual({
      [newDemarcheId('demarcheId1')]: {
        dateDebut: '1968-01-24',
        dateFin: '1981-09-13',
      },
      [newDemarcheId('demarcheId2')]: {
        dateDebut: '1981-09-13',
        dateFin: '2031-09-13',
      },
    })
  })
  test('un titre avec une prolongation rejetée doit avoir une phase de prolongation (survie provisoire)', () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2017-11-11'),
            duree: 60,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2017-11-06'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Prolongation1,
        statutId: DemarchesStatutsIds.Rejete,
        ordre: 2,
        etapes: [
          {
            id: newEtapeId('demarcheId2EtapeIdDex'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.REJETE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2023-01-01'),
            duree: 60,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId2EtapeIdDpu'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.FAIT,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2023-01-02'),
            duree: 60,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
    ]
    const titreTypeId = TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS

    const tested = titrePhasesFind(demarches, titreTypeId)
    expect(tested).toStrictEqual({
      [newDemarcheId('demarcheId1')]: {
        dateDebut: '2017-11-11',
        dateFin: '2022-11-11',
      },
      [newDemarcheId('demarcheId2')]: {
        dateDebut: '2022-11-11',
        dateFin: '2023-01-02',
      },
    })
  })
  test('un titre en modification en instance doit avoir une nouvelle phase sans date de fin', () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2017-11-11'),
            duree: 60,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2017-11-06'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Prolongation1,
        statutId: DemarchesStatutsIds.EnConstruction,
        ordre: 2,
        etapes: [
          {
            id: newEtapeId('demarcheId2EtapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: ETAPES_TYPES.demande,
            statutId: ETAPES_STATUTS.FAIT,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2022-07-08'),
            duree: 60,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
    ]
    const titreTypeId = TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS

    const tested = titrePhasesFind(demarches, titreTypeId)
    expect(tested).toStrictEqual({
      [newDemarcheId('demarcheId1')]: {
        dateDebut: '2017-11-11',
        dateFin: '2022-11-11',
      },
      [newDemarcheId('demarcheId2')]: {
        dateDebut: '2022-11-11',
        dateFin: null,
      },
    })
  })

  test(`une démarche avec une demande en construction n'est pas prise en compte`, () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2017-11-11'),
            duree: 60,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2017-11-06'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Prolongation1,
        statutId: DemarchesStatutsIds.EnConstruction,
        ordre: 2,
        etapes: [
          {
            id: newEtapeId('demarcheId2EtapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: ETAPES_TYPES.demande,
            statutId: ETAPES_STATUTS.FAIT,
            ordre: 2,
            isBrouillon: ETAPE_IS_BROUILLON,
            date: toCaminoDate('2022-07-08'),
            duree: 60,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
    ]
    const titreTypeId = TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS

    const tested = titrePhasesFind(demarches, titreTypeId)
    expect(tested).toStrictEqual({
      [newDemarcheId('demarcheId1')]: {
        dateDebut: '2017-11-11',
        dateFin: '2022-11-11',
      },
    })
  })

  test(`une démarche avec deux dpu (une acceptée, puis une de rejet) génère une phase qui se termine au rejet`, () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.Octroi,
        statutId: ETAPES_STATUTS.ACCEPTE,
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId3'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.REJETE,
            ordre: 3,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2018-11-11'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2017-11-11'),
            duree: 60,
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2017-11-06'),
            concurrence: 'non-applicable',
            hasTitreFrom: 'non-applicable',
            demarcheIdsConsentement: [],
          },
        ],
      },
    ]

    const tested = titrePhasesFind(demarches, TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS)
    expect(tested).toStrictEqual({
      [newDemarcheId('demarcheId1')]: {
        dateDebut: '2017-11-11',
        dateFin: '2018-11-11',
      },
    })
  })

  test("2 démarches avec des phases en cours ne génère qu'une seule phase en modification en instance", () => {
    const titreId = newTitreId('titreId')
    const demarcheId1 = newDemarcheId('demarcheId1')
    const demarcheId2 = newDemarcheId('demarcheId2')
    const demarcheId3 = newDemarcheId('demarcheId3')
    const demarcheId4 = newDemarcheId('demarcheId4')
    expect(
      titrePhasesFind(
        [
          {
            titreId,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            id: demarcheId1,
            etapes: [
              {
                titreDemarcheId: demarcheId1,
                ordre: 2,
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                duree: 36,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2010-11-05'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: multiPolygonWith4Points,
              },
              {
                titreDemarcheId: demarcheId1,
                ordre: 1,
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2010-10-18'),
                statutId: ETAPES_STATUTS.ACCEPTE,
              },
            ],
          },
          {
            titreId,
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 2,
            typeId: DEMARCHES_TYPES_IDS.Prolongation1,
            id: demarcheId2,
            etapes: [
              {
                titreDemarcheId: demarcheId2,
                ordre: 5,
                typeId: ETAPES_TYPES.rapportEtAvisDeLaDREAL,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-05-13'),
                statutId: ETAPES_STATUTS.FAVORABLE,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 11,
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-12-04'),
                statutId: ETAPES_STATUTS.ACCEPTE,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 9,
                typeId: ETAPES_TYPES.saisineEtAvisDuConseilGeneralDeLeconomie,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-11-09'),
                statutId: ETAPES_STATUTS.FAVORABLE,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 1,
                typeId: ETAPES_TYPES.demande,
                duree: 60,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2013-10-30'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 10,
                typeId: ETAPES_TYPES.saisineEtAvisDuConseilGeneralDeLeconomie,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-11-12'),
                statutId: ETAPES_STATUTS.FAVORABLE,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 6,
                typeId: ETAPES_TYPES.avisDuPrefet,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-06-04'),
                statutId: ETAPES_STATUTS.FAVORABLE,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 7,
                typeId: ETAPES_TYPES.saisineEtAvisDuConseilGeneralDeLeconomie,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-10-08'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 12,
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                dateFin: toCaminoDate('2018-11-05'),
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-12-17'),
                statutId: ETAPES_STATUTS.ACCEPTE,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 3,
                typeId: ETAPES_TYPES.saisineDuPrefet,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2013-11-19'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 2,
                typeId: ETAPES_TYPES.enregistrementDeLaDemande,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2013-10-30'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 4,
                typeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-02-11'),
                statutId: ETAPES_STATUTS.FAVORABLE,
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 8,
                typeId: ETAPES_TYPES.saisineEtAvisDuConseilGeneralDeLeconomie,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-10-08'),
                statutId: ETAPES_STATUTS.FAVORABLE,
              },
            ],
          },
          {
            titreId,
            statutId: DemarchesStatutsIds.Depose,
            ordre: 3,
            typeId: DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation,
            id: demarcheId3,
            etapes: [
              {
                titreDemarcheId: demarcheId3,
                ordre: 2,
                typeId: ETAPES_TYPES.enregistrementDeLaDemande,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-07-31'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId3,
                ordre: 1,
                typeId: ETAPES_TYPES.demande,
                duree: 540,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2015-07-31'),
                statutId: ETAPES_STATUTS.FAIT,
              },
            ],
          },
          {
            titreId,
            statutId: DemarchesStatutsIds.EnInstruction,
            ordre: 4,
            typeId: DEMARCHES_TYPES_IDS.Prolongation2,
            id: demarcheId4,
            etapes: [
              {
                titreDemarcheId: demarcheId4,
                ordre: 1,
                typeId: ETAPES_TYPES.demande,
                duree: 60,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2018-06-29'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 12,
                typeId: ETAPES_TYPES.rapportEtAvisDeLaDREAL,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2021-07-30'),
                statutId: ETAPES_STATUTS.FAVORABLE,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 4,
                typeId: ETAPES_TYPES.demandeDeComplements,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2019-06-13'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 10,
                typeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2020-02-04'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 14,
                typeId: ETAPES_TYPES.rapportEtAvisDeLaDREAL,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2021-12-16'),
                statutId: ETAPES_STATUTS.FAVORABLE,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 5,
                typeId: ETAPES_TYPES.receptionDeComplements,
                duree: 60,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2019-08-30'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 2,
                typeId: ETAPES_TYPES.enregistrementDeLaDemande,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2018-07-04'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 15,
                typeId: ETAPES_TYPES.participationDuPublic,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2023-01-18'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 6,
                typeId: ETAPES_TYPES.demandeDeComplements,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2019-11-19'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 3,
                typeId: ETAPES_TYPES.saisineDuPrefet,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2018-07-20'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 8,
                typeId: ETAPES_TYPES.recevabiliteDeLaDemande,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2020-01-29'),
                statutId: ETAPES_STATUTS.FAVORABLE,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 7,
                typeId: ETAPES_TYPES.receptionDeComplements,
                duree: 60,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2019-12-26'),
                statutId: ETAPES_STATUTS.FAIT,
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 13,
                typeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2021-10-29'),
                statutId: ETAPES_STATUTS.FAVORABLE,
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX
      )
    ).toMatchInlineSnapshot(`
      {
        "demarcheId1": {
          "dateDebut": "2010-11-05",
          "dateFin": "2013-11-05",
        },
        "demarcheId2": {
          "dateDebut": "2013-11-05",
          "dateFin": "2018-11-05",
        },
        "demarcheId3": {
          "dateDebut": "2018-11-05",
          "dateFin": null,
        },
      }
    `)
  })

  test('un titre qui a une décision implicite rejetée sur une prolongation a une phase', () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('nJ10z3Z74xi9OTh4oG6YXQBo'),
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            id: newDemarcheId('demarcheIdOctroi'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 2,
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                dateFin: toCaminoDate('2014-11-11'),
                duree: 60,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2009-11-11'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: multiPolygonWith4Points,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 1,
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                dateFin: toCaminoDate('2014-11-11'),
                duree: 60,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2009-10-28'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: null,
              },
            ],
          },
          {
            titreId: newTitreId('EW9cDeM6PfXS4TPznkjsNZVO'),
            statutId: ETAPES_STATUTS.REJETE,
            ordre: 2,
            typeId: DEMARCHES_TYPES_IDS.Prolongation1,
            id: newDemarcheId('demarcheIdPr1'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 3,
                typeId: ETAPES_TYPES.saisineDuPrefet,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2014-10-10'),
                statutId: ETAPES_STATUTS.FAIT,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 1,
                typeId: ETAPES_TYPES.demande,
                dateFin: null,
                duree: 60,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2014-09-18'),
                statutId: ETAPES_STATUTS.FAIT,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 4,
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2016-03-24'),
                statutId: ETAPES_STATUTS.REJETE_DECISION_IMPLICITE,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 2,
                typeId: ETAPES_TYPES.enregistrementDeLaDemande,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2014-09-24'),
                statutId: ETAPES_STATUTS.FAIT,
                geojson4326Perimetre: null,
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX
      )
    ).toEqual({
      demarcheIdOctroi: {
        dateDebut: '2009-11-11',
        dateFin: '2014-11-11',
      },
      demarcheIdPr1: {
        dateDebut: '2014-11-11',
        dateFin: '2016-03-24',
      },
    })
  })

  test('un titre qui a un désistement sur une prolongation a une phase', () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('o3RzmZvqZcKMNmaE3nwXdvkE'),
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            id: newDemarcheId('demarcheIdOctroi'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 2,
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                dateFin: toCaminoDate('2009-11-17'),
                duree: 60,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2004-11-17'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: multiPolygonWith4Points,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 1,
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                dateFin: toCaminoDate('2009-11-17'),
                duree: 60,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2004-11-08'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: null,
              },
            ],
          },
          {
            titreId: newTitreId('Mef8FKNlX0WtohaO9wGOMQZs'),
            statutId: DemarchesStatutsIds.Desiste,
            ordre: 2,
            typeId: DEMARCHES_TYPES_IDS.Prolongation1,
            id: newDemarcheId('demarcheIdPr1'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 1,
                typeId: ETAPES_TYPES.demande,
                dateFin: null,
                duree: 24,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2009-08-14'),
                statutId: ETAPES_STATUTS.FAIT,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 6,
                typeId: ETAPES_TYPES.avisDuPrefet,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2011-12-05'),
                statutId: ETAPES_STATUTS.FAVORABLE,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 3,
                typeId: ETAPES_TYPES.saisineDuPrefet,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2009-11-27'),
                statutId: ETAPES_STATUTS.FAIT,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 2,
                typeId: ETAPES_TYPES.enregistrementDeLaDemande,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2009-08-17'),
                statutId: ETAPES_STATUTS.FAIT,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 7,
                typeId: ETAPES_TYPES.desistementDuDemandeur,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2012-08-24'),
                statutId: ETAPES_STATUTS.FAIT,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 5,
                typeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2011-10-06'),
                statutId: ETAPES_STATUTS.FAVORABLE,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 4,
                typeId: ETAPES_TYPES.rapportEtAvisDeLaDREAL,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2011-06-30'),
                statutId: ETAPES_STATUTS.FAVORABLE,
                geojson4326Perimetre: null,
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX
      )
    ).toEqual({
      demarcheIdOctroi: {
        dateDebut: toCaminoDate('2004-11-17'),
        dateFin: toCaminoDate('2009-11-17'),
      },
      demarcheIdPr1: {
        dateDebut: toCaminoDate('2009-11-17'),
        dateFin: toCaminoDate('2012-08-24'),
      },
    })
  })

  test('un titre qui a une décision de l’administration rejetée sur une prolongation a une phase', () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('nJ10z3Z74xi9OTh4oG6YXQBo'),
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            id: newDemarcheId('demarcheIdOctroi'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 2,
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                dateFin: toCaminoDate('2014-11-11'),
                duree: 60,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2009-11-11'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: multiPolygonWith4Points,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 1,
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                dateFin: toCaminoDate('2014-11-11'),
                duree: 60,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2009-10-28'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: null,
              },
            ],
          },
          {
            titreId: newTitreId('EW9cDeM6PfXS4TPznkjsNZVO'),
            statutId: ETAPES_STATUTS.REJETE,
            ordre: 2,
            typeId: DEMARCHES_TYPES_IDS.Prolongation1,
            id: newDemarcheId('demarcheIdPr1'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 4,
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2016-03-24'),
                statutId: ETAPES_STATUTS.REJETE,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdPr1'),
                ordre: 2,
                typeId: ETAPES_TYPES.enregistrementDeLaDemande,
                dateFin: null,
                duree: null,
                dateDebut: null,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2014-09-24'),
                statutId: ETAPES_STATUTS.FAIT,
                geojson4326Perimetre: null,
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX
      )
    ).toEqual({
      demarcheIdOctroi: {
        dateDebut: '2009-11-11',
        dateFin: '2014-11-11',
      },
      demarcheIdPr1: {
        dateDebut: '2014-11-11',
        dateFin: '2016-03-24',
      },
    })
  })

  test('un titre qui a une décision de l’administration rejetée puis une décision de l’administration accepté a une phase', () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreId'),
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            id: newDemarcheId('demarcheIdOctroi'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 3,
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                dateFin: toCaminoDate('2033-11-22'),
                dateDebut: toCaminoDate('2003-11-22'),
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2003-11-22'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 2,
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                dateFin: toCaminoDate('2033-11-22'),
                dateDebut: toCaminoDate('2003-11-22'),
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2003-11-22'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 1,
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2003-04-26'),
                statutId: ETAPES_STATUTS.REJETE,
                geojson4326Perimetre: null,
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE
      )
    ).toMatchInlineSnapshot(`
      {
        "demarcheIdOctroi": {
          "dateDebut": "2003-11-22",
          "dateFin": "2033-11-22",
        },
      }
    `)
  })

  test('un titre qui a une publication au jorf rejetée puis une publication au jorf acceptée a une phase', () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreId'),
            statutId: ETAPES_STATUTS.ACCEPTE,
            ordre: 1,
            typeId: DEMARCHES_TYPES_IDS.Octroi,
            id: newDemarcheId('demarcheIdOctroi'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 3,
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                dateFin: toCaminoDate('2033-11-23'),
                dateDebut: toCaminoDate('2003-11-23'),
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2003-11-23'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 2,
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                dateFin: toCaminoDate('2033-11-22'),
                dateDebut: toCaminoDate('2003-11-22'),
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2003-11-22'),
                statutId: ETAPES_STATUTS.REJETE,
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 1,
                typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('2003-04-26'),
                statutId: ETAPES_STATUTS.ACCEPTE,
                geojson4326Perimetre: null,
              },
            ],
          },
        ],
        TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX
      )
    ).toMatchInlineSnapshot(`
      {
        "demarcheIdOctroi": {
          "dateDebut": "2003-11-23",
          "dateFin": "2033-11-23",
        },
      }
    `)
  })
  // pour regénérer le fichier titre-phases-find.cas.json: `npm run test:generate-phase-data -w packages/api`
  test.each(titresProd as TitrePhasesTest[])('cas réel N°%#', (titreTypeId, demarches) => {
    const expectedResult = demarches.reduce<Record<DemarcheId, { dateDebut: CaminoDate | null | undefined; dateFin: CaminoDate | null | undefined }>>((acc, d) => {
      if (d.demarcheDateDebut || d.demarcheDateFin) {
        acc[d.id] = { dateDebut: d.demarcheDateDebut, dateFin: d.demarcheDateFin }
      }

      return acc
    }, {})
    expect(titrePhasesFind(demarches, titreTypeId)).toStrictEqual(expectedResult)
  })
})
