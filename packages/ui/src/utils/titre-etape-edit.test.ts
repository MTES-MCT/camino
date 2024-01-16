import { etapeEditFormat } from './titre-etape-edit'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes'
import { describe, expect, test } from 'vitest'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { etapeIdValidator } from 'camino-common/src/etape'

// dateFormat
describe('etapeEditFormat', () => {
  test("formate une étape pour l'éditer", () => {
    expect(
      // @ts-ignore
      etapeEditFormat({
        id: etapeIdValidator.parse('etape-id'),
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
      documents: [],
    })

    expect(
      // @ts-ignore
      etapeEditFormat({
        id: etapeIdValidator.parse('etape-id'),
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
      documents: [],
      justificatifs: [{ id: 'toto', nom: 'name' }],
    })

    expect(
      etapeEditFormat({
        id: etapeIdValidator.parse('etape-id'),
        type: { id: 'aac', nom: 'plop' },
        // @ts-ignore
        statutId: 'etape-statut-id',
        duree: 240,
        administrations: ['aut-97300-01'],
        titulaires: [{ id: newEntrepriseId('titulaire-id'), operateur: false }],
        contenu: { 'prop-id': 'prop-value' },
        substances: ['auru'],
        documents: [{ typeId: 'aac' }],
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
      documents: [{ fichierNouveau: null, typeId: 'aac' }],
    })
  })
})
