import { etapeEditFormat } from './titre-etape-edit'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes'
import { describe, expect, test } from 'vitest'
import { newEntrepriseId } from 'camino-common/src/entreprise'

// dateFormat
describe('etapeEditFormat', () => {
  test("formate une étape pour l'éditer", () => {
    expect(
      // @ts-ignore
      etapeEditFormat({
        id: 'etape-id',
      })
    ).toEqual({
      id: 'etape-id',
      amodiataires: [],
      titulaires: [],
      geoSystemeIds: [],
      geoSystemeOpposableId: null,
      groupes: [],
      substances: [],
      contenu: {},
      incertitudes: {
        amodiataires: false,
        date: false,
        dateDebut: false,
        dateFin: false,
        duree: false,
        points: false,
        substances: false,
        surface: false,
        titulaires: false,
      },
      documents: [],
      justificatifs: [],
    })

    expect(
      // @ts-ignore
      etapeEditFormat({
        id: 'etape-id',
        points: [
          {
            id: 'point-id-111',
            groupe: 1,
            contour: 1,
            point: 1,
            references: [
              {
                opposable: true,
                geoSystemeId: GEO_SYSTEME_IDS.WGS84,
                coordonnees: { x: 1.5, y: 1 },
                id: 'ref',
              },
            ],
          },
        ],
        justificatifs: [{ id: 'toto', nom: 'name' }],
      })
    ).toEqual({
      id: 'etape-id',
      amodiataires: [],
      titulaires: [],
      geoSystemeIds: [GEO_SYSTEME_IDS.WGS84],
      geoSystemeOpposableId: GEO_SYSTEME_IDS.WGS84,
      groupes: [
        [
          [
            {
              id: 'point-id-111',
              description: undefined,
              nom: undefined,
              references: {
                [GEO_SYSTEME_IDS.WGS84]: { id: 'ref', x: 1.5, y: 1 },
              },
              lot: undefined,
              subsidiaire: undefined,
            },
          ],
        ],
      ],
      substances: [],
      contenu: {},
      incertitudes: {
        amodiataires: false,
        date: false,
        dateDebut: false,
        dateFin: false,
        duree: false,
        points: false,
        substances: false,
        surface: false,
        titulaires: false,
      },
      documents: [],
      justificatifs: [{ id: 'toto', nom: 'name' }],
    })

    expect(
      etapeEditFormat({
        id: 'etape-id',
        type: { id: 'aac', nom: 'plop' },
        // @ts-ignore
        statutId: 'etape-statut-id',
        duree: 240,
        administrations: ['aut-97300-01'],
        titulaires: [{ id: newEntrepriseId('titulaire-id'), operateur: false }],
        points: [
          {
            id: 'point-id-111',
            groupe: 1,
            contour: 1,
            point: 1,
            references: [
              {
                geoSystemeId: GEO_SYSTEME_IDS.WGS84,
                coordonnees: { x: 1.5, y: 1 },
                id: 'ref',
              },
            ],
          },
          {
            id: 'point-id-113',
            groupe: 1,
            contour: 1,
            point: 3,
            lot: 1,
            references: [
              {
                geoSystemeId: GEO_SYSTEME_IDS.WGS84,
                coordonnees: { x: 1.5, y: 3 },
                id: 'ref3',
              },
            ],
          },
          {
            id: 'point-id-114',
            groupe: 1,
            contour: 1,
            point: 4,
            lot: 1,
            references: [
              {
                geoSystemeId: GEO_SYSTEME_IDS.WGS84,

                coordonnees: { x: 1.5, y: 4 },
                id: 'ref2',
              },
            ],
          },
        ],
        contenu: { 'prop-id': 'prop-value' },
        incertitudes: {
          amodiataires: true,
          date: false,
          dateDebut: false,
          dateFin: false,
          duree: false,
          points: false,
          substances: false,
          surface: false,
          titulaires: false,
        },
        substances: ['auru'],
        documents: [{ type: { id: 'aac' } }],
      })
    ).toEqual({
      id: 'etape-id',
      type: { id: 'aac', nom: 'plop' },
      statutId: 'etape-statut-id',
      duree: 240,
      amodiataires: [],
      titulaires: [{ id: 'titulaire-id', operateur: false }],
      geoSystemeIds: [GEO_SYSTEME_IDS.WGS84],
      geoSystemeOpposableId: undefined,
      groupes: [
        [
          [
            {
              id: 'point-id-111',
              description: undefined,
              nom: undefined,
              references: {
                [GEO_SYSTEME_IDS.WGS84]: { id: 'ref', x: 1.5, y: 1 },
              },
              lot: undefined,
              subsidiaire: undefined,
            },
            {
              id: 'point-id-113',
              description: undefined,
              references: [
                { id: 'ref3', x: 1.5, y: 3 },
                { id: 'ref2', x: 1.5, y: 4 },
              ],
              lot: 1,
              subsidiaire: undefined,
            },
          ],
        ],
      ],
      substances: ['auru'],
      contenu: { 'prop-id': 'prop-value' },
      incertitudes: {
        amodiataires: true,
        date: false,
        dateDebut: false,
        dateFin: false,
        duree: false,
        points: false,
        substances: false,
        surface: false,
        titulaires: false,
      },
      documents: [{ fichierNouveau: null, typeId: 'aac', type: { id: 'aac' } }],
      justificatifs: [],
    })
  })
})
