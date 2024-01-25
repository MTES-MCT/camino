import { ITitreDemarche } from '../../types.js'
import { DemarcheId, demarcheSlugValidator } from 'camino-common/src/demarche.js'

import { titrePhasesFind, TitreDemarchePhaseFind } from './titre-phases-find.js'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create.js'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'

import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts.js'
import { etapeSlugValidator } from 'camino-common/src/etape.js'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre.js'
const titresProd = require('./titre-phases-find.cas.json')

export type TitrePhasesTest = [TitreTypeId, TitreDemarchePhaseFind[]]
const multiPolygonWith4Points: FeatureMultiPolygon = {type: 'Feature', properties: {}, geometry: {type: 'MultiPolygon', coordinates: [[[[1, 2], [1, 2], [1, 2], [1, 2]]]]}}

describe("phases d'une démarche", () => {
  test("un titre qui a une démarche d'octroi avec une dpu a une phase", () => {
    expect(
      titrePhasesFind(
        [
          {
            titreId: newTitreId('titreid'),
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2200-01-01'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
              },
              {
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2200-01-01'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
              },
            ],
          },
        ],
        'cxh'
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
            typeId: 'oct',
            statutId: 'acc',
            etapes: [],
          },
        ],
        'cxh'
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
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2200-01-01'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('h-ax-courdemanges-1988-oct01'),
              },
            ],
          },
        ],
        'axm'
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
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                typeId: 'rpu',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2200-01-02'),
                titreDemarcheId: newDemarcheId('m-pr-courdemanges-1988-oct01'),
              },
            ],
          },
        ],
        'prm'
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
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2200-01-01'),
                dateDebut: toCaminoDate('2200-01-02'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
              },
              {
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2200-01-01'),
                dateDebut: toCaminoDate('2200-01-02'),
                duree: 2 * 12,
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
              },
            ],
          },
        ],
        'cxh'
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
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2500-01-01'),
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2500-01-01'),
              },
            ],
          },
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-pro01'),
            typeId: 'pro',
            statutId: 'acc',
            ordre: 2,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-pro01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2300-01-02'),
                dateFin: toCaminoDate('3000-01-01'),
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-pro01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2300-01-02'),
                dateFin: toCaminoDate('3000-01-01'),
              },
            ],
          },
        ],
        'cxh'
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
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2000-01-02'),
                duree: 20 * 12,
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2000-01-01'),
                duree: 20 * 12,
              },
            ],
          },
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-ren01'),
            typeId: 'ren',
            statutId: 'acc',
            ordre: 2,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2019-01-03'),
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2019-01-02'),
              },
            ],
          },
        ],
        'cxh'
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
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2000-01-02'),
                duree: 20 * 12,
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2000-01-01'),
                duree: 20 * 12,
              },
            ],
          },
          {
            titreId: newTitreId('titreId'),
            id: newDemarcheId('h-cx-courdemanges-1988-ren01'),
            typeId: 'ren',
            statutId: 'acc',
            ordre: 2,
            etapes: [
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2019-01-03'),
              },
              {
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2019-01-02'),
                geojson4326Perimetre: multiPolygonWith4Points,
              },
            ],
          },
        ],
        'cxh'
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
        typeId: 'mut',
        statutId: 'cls',
        etapes: [
          { titreDemarcheId: demarcheId1, id: newEtapeId('3'), ordre: 1, date: toCaminoDate('2016-12-28'), duree: 1920, surface: 5.51, typeId: 'mfr', statutId: 'fai' },
          { titreDemarcheId: demarcheId1, id: newEtapeId('1'), ordre: 2, date: toCaminoDate('2016-12-28'), typeId: 'mdp', statutId: 'fai' },
          { titreDemarcheId: demarcheId1, id: newEtapeId('2'), ordre: 3, date: toCaminoDate('2017-04-07'), typeId: 'css', statutId: 'fai' },
        ],
      },
      {
        id: demarcheId2,
        titreId,
        ordre: 10,
        typeId: 'pro',
        statutId: 'cls',
        etapes: [
          { titreDemarcheId: demarcheId2, id: newEtapeId('4'), ordre: 1, date: toCaminoDate('2016-12-28'), duree: 1920, surface: 5.51, typeId: 'mfr', statutId: 'fai' },
          { titreDemarcheId: demarcheId2, id: newEtapeId('5'), ordre: 2, date: toCaminoDate('2016-12-28'), typeId: 'mdp', statutId: 'fai' },
          { titreDemarcheId: demarcheId2, id: newEtapeId('6'), ordre: 3, date: toCaminoDate('2017-04-07'), typeId: 'css', statutId: 'fai' },
        ],
      },
      {
        titreId,
        id: demarcheId3,
        ordre: 9,
        typeId: 'dam',
        statutId: 'ins',
        etapes: [
          { id: newEtapeId('7'), titreDemarcheId: demarcheId3, ordre: 3, date: toCaminoDate('2014-12-23'), typeId: 'wpp', statutId: 'fai' },
          { id: newEtapeId('8'), titreDemarcheId: demarcheId3, ordre: 1, date: toCaminoDate('2013-08-01'), typeId: 'wfd', statutId: 'fai' },
          { id: newEtapeId('9'), titreDemarcheId: demarcheId3, ordre: 2, date: toCaminoDate('2014-08-25'), typeId: 'wre', statutId: 'fav' },
        ],
      },
      {
        titreId,
        id: demarcheId4,
        ordre: 8,
        typeId: 'mut',
        statutId: 'acc',
        etapes: [
          { id: newEtapeId('10'), titreDemarcheId: demarcheId4, ordre: 1, date: toCaminoDate('2002-12-24'), typeId: 'dex', statutId: 'acc' },
          { titreDemarcheId: demarcheId4, id: newEtapeId('11'), ordre: 2, date: toCaminoDate('2003-01-08'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId5,
        ordre: 7,
        typeId: 'mut',
        statutId: 'acc',
        etapes: [
          { id: newEtapeId('12'), titreDemarcheId: demarcheId5, ordre: 1, date: toCaminoDate('2000-09-26'), typeId: 'dex', statutId: 'acc' },
          { id: newEtapeId('13'), titreDemarcheId: demarcheId5, ordre: 2, date: toCaminoDate('2000-10-06'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId6,
        ordre: 6,
        typeId: 'mut',
        statutId: 'acc',
        etapes: [
          { id: newEtapeId('id'), titreDemarcheId: demarcheId6, ordre: 1, date: toCaminoDate('1975-11-24'), typeId: 'dex', statutId: 'acc' },
          { id: newEtapeId('15'), titreDemarcheId: demarcheId6, ordre: 2, date: toCaminoDate('1975-11-27'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId7,
        ordre: 5,
        typeId: 'mut',

        statutId: 'acc',
        etapes: [
          { id: newEtapeId('16'), titreDemarcheId: demarcheId7, ordre: 1, date: toCaminoDate('1970-11-16'), typeId: 'dex', statutId: 'acc' },
          { id: newEtapeId('17'), titreDemarcheId: demarcheId7, ordre: 2, date: toCaminoDate('1970-11-19'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId8,
        ordre: 4,
        typeId: 'mut',
        statutId: 'acc',
        etapes: [
          { id: newEtapeId('18'), titreDemarcheId: demarcheId8, ordre: 2, date: toCaminoDate('1949-08-31'), typeId: 'dpu', statutId: 'acc' },
          { id: newEtapeId('19'), titreDemarcheId: demarcheId8, ordre: 1, date: toCaminoDate('1949-08-23'), typeId: 'dex', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId9,
        ordre: 3,
        typeId: 'exp',
        statutId: 'acc',
        etapes: [
          { id: newEtapeId('20'), titreDemarcheId: demarcheId9, ordre: 1, date: toCaminoDate('1889-02-27'), typeId: 'dex', statutId: 'acc' },
          { id: newEtapeId('21'), titreDemarcheId: demarcheId9, ordre: 2, date: toCaminoDate('1889-02-27'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId10,
        ordre: 2,
        typeId: 'exp',
        statutId: 'acc',
        etapes: [
          { id: newEtapeId('22'), titreDemarcheId: demarcheId10, ordre: 2, date: toCaminoDate('1879-11-14'), typeId: 'dpu', statutId: 'acc' },
          { id: newEtapeId('23'), titreDemarcheId: demarcheId10, ordre: 1, date: toCaminoDate('1879-07-26'), typeId: 'dex', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId11,
        ordre: 1,
        typeId: 'oct',
        statutId: 'acc',
        etapes: [
          { id: newEtapeId('24'), titreDemarcheId: demarcheId11, ordre: 1, date: toCaminoDate('1858-03-24'), typeId: 'dex', statutId: 'acc' },
          { id: newEtapeId('25'), titreDemarcheId: demarcheId11, ordre: 2, date: toCaminoDate('1858-03-24'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
    ]

    const tested = titrePhasesFind(demarches, 'cxm')
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
        typeId: 'pro',
        statutId: 'cls',
        etapes: [
          { titreDemarcheId: demarcheIdProlongation, id: newEtapeId('2'), ordre: 3, date: toCaminoDate('2011-04-07'), typeId: 'css', statutId: 'fai' },
          { titreDemarcheId: demarcheIdProlongation, id: newEtapeId('1'), ordre: 2, date: toCaminoDate('2008-12-28'), typeId: 'mdp', statutId: 'fai' },
          { titreDemarcheId: demarcheIdProlongation, id: newEtapeId('3'), ordre: 1, date: toCaminoDate('2008-12-28'), duree: 60, typeId: 'mfr', statutId: 'fai' },
        ],
      },
      {
        titreId,
        id: demarcheIdOctroi,
        ordre: 1,
        typeId: 'oct',
        statutId: 'acc',
        etapes: [
          { id: newEtapeId('24'), titreDemarcheId: demarcheIdOctroi, ordre: 1, date: toCaminoDate('2000-03-24'), typeId: 'dex', statutId: 'acc', duree: 120 },
          { id: newEtapeId('25'), titreDemarcheId: demarcheIdOctroi, ordre: 2, date: toCaminoDate('2000-03-24'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
    ]

    const tested = titrePhasesFind(demarches, 'cxm')
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
        typeId: 'oct',
        statutId: 'acc',
        etapes: [
          { id: newEtapeId('24'), titreDemarcheId: demarcheIdOctroi, ordre: 1, date: toCaminoDate('2000-03-24'), typeId: 'dex', statutId: 'acc', duree: 120 },
          { id: newEtapeId('25'), titreDemarcheId: demarcheIdOctroi, ordre: 2, date: toCaminoDate('2000-03-24'), typeId: 'dpu', statutId: 'rej' },
        ],
      },
    ]

    const tested = titrePhasesFind(demarches, 'cxm')
    expect(tested).toStrictEqual({})
  })

  test("modification d'une mutation suite à renonciation totale en décision implicite", () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: newTitreId('titreId'),
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1970-09-17'),
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1970-09-09'),
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: newTitreId('titreId'),
        typeId: 'mut',
        statutId: 'acc',
        ordre: 2,
        slug: demarcheSlugValidator.parse('m-cx-pontaubert-1970-mut01'),
        etapes: [
          {
            id: newEtapeId('demarcheId2EtapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1994-10-18'),
            dateFin: toCaminoDate('2044-10-18'),
            duree: 600,
          },
          {
            id: newEtapeId('demarcheId2EtapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1994-10-13'),
            duree: 600,
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId3'),
        titreId: newTitreId('titreId'),
        typeId: 'ren',
        statutId: 'acc',
        ordre: 3,
        etapes: [
          {
            id: newEtapeId('demarcheId3etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'mfr',
            statutId: 'fai',
            ordre: 1,
            date: toCaminoDate('2019-10-22'),
          },
          {
            id: newEtapeId('demarcheId3etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'mdp',
            statutId: 'fai',
            ordre: 2,
            date: toCaminoDate('2019-11-20'),
          },
          {
            id: newEtapeId('demarcheId3etapeId5'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 5,
            date: toCaminoDate('2022-05-09'),
          },
          {
            id: newEtapeId('demarcheId3etapeId6'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 6,
            date: toCaminoDate('2022-05-09'),
          },
          {
            id: newEtapeId('demarcheId3etapeId3'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'apd',
            statutId: 'fav',
            ordre: 3,
            date: toCaminoDate('2020-05-11'),
          },
          {
            id: newEtapeId('demarcheId3etapeId4'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'app',
            statutId: 'fav',
            ordre: 4,
            date: toCaminoDate('2020-06-30'),
            slug: etapeSlugValidator.parse('m-cx-pontaubert-1970-ren01-app01'),
          },
        ],
      },
    ]
    const titreTypeId = 'cxm'

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
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1970-09-17'),
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1970-09-09'),
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: newTitreId('titreId'),
        typeId: 'mut',
        statutId: 'acc',
        ordre: 2,
        etapes: [
          {
            id: newEtapeId('demarcheId2EtapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1994-10-18'),
            dateFin: toCaminoDate('2044-10-18'),
            duree: 600,
          },
          {
            id: newEtapeId('demarcheId2EtapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1994-10-13'),
            duree: 600,
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId3'),
        titreId: newTitreId('titreId'),
        typeId: 'ren',
        statutId: 'acc',
        ordre: 3,
        etapes: [
          {
            id: newEtapeId('demarcheId3etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'mfr',
            statutId: 'fai',
            ordre: 1,
            date: toCaminoDate('2019-10-22'),
          },
          {
            id: newEtapeId('demarcheId3etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'mdp',
            statutId: 'fai',
            ordre: 2,
            date: toCaminoDate('2019-11-20'),
          },
          {
            id: newEtapeId('demarcheId3etapeId3'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'apd',
            statutId: 'fav',
            ordre: 3,
            date: toCaminoDate('2020-05-11'),
          },
          {
            id: newEtapeId('demarcheId3etapeId5'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'dim',
            statutId: 'acc',
            ordre: 5,
            date: toCaminoDate('2022-05-09'),
          },
          {
            id: newEtapeId('demarcheId3etapeId4'),
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'app',
            statutId: 'fav',
            ordre: 4,
            date: toCaminoDate('2020-06-30'),
          },
        ],
      },
    ]
    const titreTypeId = 'cxm'

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
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1968-01-24'),
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1968-01-13'),
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: newTitreId('titreId'),
        typeId: DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
        statutId: 'acc',
        ordre: 2,
        etapes: [
          {
            id: newEtapeId('demarcheId2EtapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1981-09-13'),
            dateFin: toCaminoDate('2031-09-13'),
          },
          {
            id: newEtapeId('demarcheId2EtapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1981-09-09'),
          },
        ],
      },
    ]
    const titreTypeId = 'cxm'

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

  test('un titre en modification en instance doit avoir une nouvelle phase sans date de fin', () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: newTitreId('titreId'),
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('2017-11-11'),
            duree: 60,
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('2017-11-06'),
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
            typeId: 'mfr',
            statutId: 'fai',
            ordre: 2,
            date: toCaminoDate('2022-07-08'),
            duree: 60,
          },
        ],
      },
    ]
    const titreTypeId = 'prw'

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
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('2017-11-11'),
            duree: 60,
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('2017-11-06'),
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
            typeId: 'mfr',
            statutId: ETAPES_STATUTS.EN_CONSTRUCTION,
            ordre: 2,
            date: toCaminoDate('2022-07-08'),
            duree: 60,
          },
        ],
      },
    ]
    const titreTypeId = 'prw'

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
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: newEtapeId('demarcheId1etapeId3'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'rej',
            ordre: 3,
            date: toCaminoDate('2018-11-11'),
          },
          {
            id: newEtapeId('demarcheId1etapeId2'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('2017-11-11'),
            duree: 60,
          },
          {
            id: newEtapeId('demarcheId1etapeId1'),
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('2017-11-06'),
          },
        ],
      },
    ]

    const tested = titrePhasesFind(demarches, 'prw')
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
            statutId: 'acc',
            ordre: 1,
            typeId: 'oct',
            id: demarcheId1,
            etapes: [
              {
                titreDemarcheId: demarcheId1,
                ordre: 2,
                typeId: 'dpu',
                duree: 36,
                date: toCaminoDate('2010-11-05'),
                statutId: 'acc',
                geojson4326Perimetre: multiPolygonWith4Points,
              },
              {
                titreDemarcheId: demarcheId1,
                ordre: 1,
                typeId: 'dex',
                date: toCaminoDate('2010-10-18'),
                statutId: 'acc',
              },
            ],
          },
          {
            titreId,
            statutId: 'acc',
            ordre: 2,
            typeId: 'pr1',
            id: demarcheId2,
            etapes: [
              {
                titreDemarcheId: demarcheId2,
                ordre: 5,
                typeId: 'apd',
                date: toCaminoDate('2015-05-13'),
                statutId: 'fav',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 11,
                typeId: 'dex',
                date: toCaminoDate('2015-12-04'),
                statutId: 'acc',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 9,
                typeId: 'acg',
                date: toCaminoDate('2015-11-09'),
                statutId: 'fav',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 1,
                typeId: 'mfr',
                duree: 60,
                date: toCaminoDate('2013-10-30'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 10,
                typeId: 'acg',
                date: toCaminoDate('2015-11-12'),
                statutId: 'fav',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 6,
                typeId: 'app',
                date: toCaminoDate('2015-06-04'),
                statutId: 'fav',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 7,
                typeId: 'scg',
                date: toCaminoDate('2015-10-08'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 12,
                typeId: 'dpu',
                dateFin: toCaminoDate('2018-11-05'),
                date: toCaminoDate('2015-12-17'),
                statutId: 'acc',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 3,
                typeId: 'spp',
                date: toCaminoDate('2013-11-19'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 2,
                typeId: 'mdp',
                date: toCaminoDate('2013-10-30'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 4,
                typeId: 'apo',
                date: toCaminoDate('2015-02-11'),
                statutId: 'fav',
              },
              {
                titreDemarcheId: demarcheId2,
                ordre: 8,
                typeId: 'rcg',
                date: toCaminoDate('2015-10-08'),
                statutId: 'fav',
              },
            ],
          },
          {
            titreId,
            statutId: 'dep',
            ordre: 3,
            typeId: 'vct',
            id: demarcheId3,
            etapes: [
              {
                titreDemarcheId: demarcheId3,
                ordre: 2,
                typeId: 'mdp',
                date: toCaminoDate('2015-07-31'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId3,
                ordre: 1,
                typeId: 'mfr',
                duree: 540,
                date: toCaminoDate('2015-07-31'),
                statutId: 'fai',
              },
            ],
          },
          {
            titreId,
            statutId: 'ins',
            ordre: 4,
            typeId: 'pr2',
            id: demarcheId4,
            etapes: [
              {
                titreDemarcheId: demarcheId4,
                ordre: 1,
                typeId: 'mfr',
                duree: 60,
                date: toCaminoDate('2018-06-29'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 12,
                typeId: 'apd',
                date: toCaminoDate('2021-07-30'),
                statutId: 'fav',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 4,
                typeId: 'mco',
                date: toCaminoDate('2019-06-13'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 10,
                typeId: 'aac',
                date: toCaminoDate('2020-02-04'),
                statutId: 'fre',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 14,
                typeId: 'apd',
                date: toCaminoDate('2021-12-16'),
                statutId: 'fav',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 11,
                typeId: 'apm',
                date: toCaminoDate('2020-02-24'),
                statutId: 'def',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 5,
                typeId: 'rco',
                duree: 60,
                date: toCaminoDate('2019-08-30'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 9,
                typeId: 'apl',
                date: toCaminoDate('2020-01-31'),
                statutId: 'def',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 2,
                typeId: 'mdp',
                date: toCaminoDate('2018-07-04'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 15,
                typeId: 'ppu',
                date: toCaminoDate('2023-01-18'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 6,
                typeId: 'mco',
                date: toCaminoDate('2019-11-19'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 3,
                typeId: 'spp',
                date: toCaminoDate('2018-07-20'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 16,
                typeId: 'ppc',
                date: toCaminoDate('2023-02-08'),
                statutId: 'ter',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 8,
                typeId: 'mcr',
                date: toCaminoDate('2020-01-29'),
                statutId: 'fav',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 7,
                typeId: 'rco',
                duree: 60,
                date: toCaminoDate('2019-12-26'),
                statutId: 'fai',
              },
              {
                titreDemarcheId: demarcheId4,
                ordre: 13,
                typeId: 'apo',
                date: toCaminoDate('2021-10-29'),
                statutId: 'fav',
              },
            ],
          },
        ],
        'prm'
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
            statutId: 'acc',
            ordre: 1,
            typeId: 'oct',
            id: newDemarcheId('demarcheIdOctroi'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 2,
                typeId: 'dpu',
                dateFin: toCaminoDate('2014-11-11'),
                duree: 60,
                dateDebut: null,
                date: toCaminoDate('2009-11-11'),
                statutId: 'acc',
                geojson4326Perimetre: multiPolygonWith4Points,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 1,
                typeId: 'dex',
                dateFin: toCaminoDate('2014-11-11'),
                duree: 60,
                dateDebut: null,
                date: toCaminoDate('2009-10-28'),
                statutId: 'acc',
                geojson4326Perimetre: null,
              },
            ],
          },
          {
            titreId: newTitreId('EW9cDeM6PfXS4TPznkjsNZVO'),
            statutId: 'rej',
            ordre: 2,
            typeId: 'pr1',
            id: newDemarcheId('demarcheIdPr1'),
            etapes: [
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 3, typeId: 'spp', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2014-10-10'), statutId: 'fai', geojson4326Perimetre: null },
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 1, typeId: 'mfr', dateFin: null, duree: 60, dateDebut: null, date: toCaminoDate('2014-09-18'), statutId: 'fai', geojson4326Perimetre: null },
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 4, typeId: 'dim', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2016-03-24'), statutId: 'rej', geojson4326Perimetre: null },
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 2, typeId: 'mdp', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2014-09-24'), statutId: 'fai', geojson4326Perimetre: null },
            ],
          },
        ],
        'pxm'
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
            statutId: 'acc',
            ordre: 1,
            typeId: 'oct',
            id: newDemarcheId('demarcheIdOctroi'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 2,
                typeId: 'dpu',
                dateFin: toCaminoDate('2009-11-17'),
                duree: 60,
                dateDebut: null,
                date: toCaminoDate('2004-11-17'),
                statutId: 'acc',
                geojson4326Perimetre: multiPolygonWith4Points,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 1,
                typeId: 'dex',
                dateFin: toCaminoDate('2009-11-17'),
                duree: 60,
                dateDebut: null,
                date: toCaminoDate('2004-11-08'),
                statutId: 'acc',
                geojson4326Perimetre: null,
              },
            ],
          },
          {
            titreId: newTitreId('Mef8FKNlX0WtohaO9wGOMQZs'),
            statutId: 'des',
            ordre: 2,
            typeId: 'pr1',
            id: newDemarcheId('demarcheIdPr1'),
            etapes: [
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 1, typeId: 'mfr', dateFin: null, duree: 24, dateDebut: null, date: toCaminoDate('2009-08-14'), statutId: 'fai', geojson4326Perimetre: null },
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 6, typeId: 'app', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2011-12-05'), statutId: 'fav', geojson4326Perimetre: null },
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 3, typeId: 'spp', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2009-11-27'), statutId: 'fai', geojson4326Perimetre: null },
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 2, typeId: 'mdp', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2009-08-17'), statutId: 'fai', geojson4326Perimetre: null },
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 7, typeId: 'des', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2012-08-24'), statutId: 'fai', geojson4326Perimetre: null },
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 5, typeId: 'apo', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2011-10-06'), statutId: 'fav', geojson4326Perimetre: null },
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 4, typeId: 'apd', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2011-06-30'), statutId: 'fav', geojson4326Perimetre: null },
            ],
          },
        ],
        'pxm'
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
            statutId: 'acc',
            ordre: 1,
            typeId: 'oct',
            id: newDemarcheId('demarcheIdOctroi'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 2,
                typeId: 'dpu',
                dateFin: toCaminoDate('2014-11-11'),
                duree: 60,
                dateDebut: null,
                date: toCaminoDate('2009-11-11'),
                statutId: 'acc',
                geojson4326Perimetre: multiPolygonWith4Points,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 1,
                typeId: 'dex',
                dateFin: toCaminoDate('2014-11-11'),
                duree: 60,
                dateDebut: null,
                date: toCaminoDate('2009-10-28'),
                statutId: 'acc',
                geojson4326Perimetre: null,
              },
            ],
          },
          {
            titreId: newTitreId('EW9cDeM6PfXS4TPznkjsNZVO'),
            statutId: 'rej',
            ordre: 2,
            typeId: 'pr1',
            id: newDemarcheId('demarcheIdPr1'),
            etapes: [
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 4, typeId: 'dex', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2016-03-24'), statutId: 'rej', geojson4326Perimetre: null },
              { titreDemarcheId: newDemarcheId('demarcheIdPr1'), ordre: 2, typeId: 'mdp', dateFin: null, duree: null, dateDebut: null, date: toCaminoDate('2014-09-24'), statutId: 'fai', geojson4326Perimetre: null },
            ],
          },
        ],
        'pxm'
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
            statutId: 'acc',
            ordre: 1,
            typeId: 'oct',
            id: newDemarcheId('demarcheIdOctroi'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 3,
                typeId: 'dpu',
                dateFin: toCaminoDate('2033-11-22'),
                dateDebut: toCaminoDate('2003-11-22'),
                date: toCaminoDate('2003-11-22'),
                statutId: 'acc',
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 2,
                typeId: 'dex',
                dateFin: toCaminoDate('2033-11-22'),
                dateDebut: toCaminoDate('2003-11-22'),
                date: toCaminoDate('2003-11-22'),
                statutId: 'acc',
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 1,
                typeId: 'dex',
                date: toCaminoDate('2003-04-26'),
                statutId: 'rej',
                geojson4326Perimetre: null,
              },
            ],
          },
        ],
        'cxh'
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
            statutId: 'acc',
            ordre: 1,
            typeId: 'oct',
            id: newDemarcheId('demarcheIdOctroi'),
            etapes: [
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 3,
                typeId: 'dpu',
                dateFin: toCaminoDate('2033-11-23'),
                dateDebut: toCaminoDate('2003-11-23'),
                date: toCaminoDate('2003-11-23'),
                statutId: 'acc',
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 2,
                typeId: 'dpu',
                dateFin: toCaminoDate('2033-11-22'),
                dateDebut: toCaminoDate('2003-11-22'),
                date: toCaminoDate('2003-11-22'),
                statutId: 'rej',
                geojson4326Perimetre: null,
              },
              {
                titreDemarcheId: newDemarcheId('demarcheIdOctroi'),
                ordre: 1,
                typeId: 'dex',
                date: toCaminoDate('2003-04-26'),
                statutId: 'acc',
                geojson4326Perimetre: null,
              },
            ],
          },
        ],
        'prm'
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

  test('cas réels', () => {
    const phasesReels = titresProd as TitrePhasesTest[]
    phasesReels.forEach(([titreTypeId, demarches], index) => {
      const expectedResult = demarches.reduce<Record<DemarcheId, { dateDebut: CaminoDate | null | undefined; dateFin: CaminoDate | null | undefined }>>((acc, d) => {
        if (d.demarcheDateDebut || d.demarcheDateFin) {
          acc[d.id] = { dateDebut: d.demarcheDateDebut, dateFin: d.demarcheDateFin }
        }

        return acc
      }, {})
      expect(titrePhasesFind(demarches, titreTypeId), `test N*${index}`).toStrictEqual(expectedResult)
    })
  })
})
