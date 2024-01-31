import { etapeSaveFormat } from './titre-etape-save'
import { describe, expect, test } from 'vitest'

// dateFormat
describe('etapeSaveFormat', () => {
  test("formate une étape pour l'enregistrer", () => {
    expect(
      etapeSaveFormat({
        id: 'etape-id',
        type: { id: 'mfr' },
        titreDemarcheId: 'demarche-id',
        statutId: '',
        dateFin: '',
        duree: null,
        amodiataires: [],
        titulaires: [],
        geoSystemeIds: [],
        geoSystemeOpposableId: null,
        groupes: [],
        substances: [],
        contenu: {},
      })
    ).toEqual({
      amodiataires: [],
      duree: null,
      dateFin: null,
      id: 'etape-id',
      points: null,
      statutId: '',
      substances: [],
      titreDemarcheId: 'demarche-id',
      titulaires: [],
      typeId: 'mfr',
    })

    expect(
      etapeSaveFormat({
        id: 'etape-id',
        type: { id: 'mfr' },
        titreDemarcheId: 'demarche-id',
        statutId: '',
        duree: 10,
        amodiataires: [],
        titulaires: [],
        geoSystemeIds: ['geo-systeme-id', 'geo-systeme-id-2'],
        geoSystemeOpposableId: 'geo-systeme-id',
        groupes: [
          [
            [
              {
                references: {
                  'geo-systeme-id': { id: 'id1', x: 1.5, y: 1 },
                  'geo-systeme-id-2': { x: undefined, y: undefined },
                },
              },
              {
                references: {
                  'geo-systeme-id': { x: undefined, y: undefined },
                  'geo-systeme-id-2': { id: 'id3', x: 1.5, y: 1 },
                },
              },
            ],
          ],
        ],
        substances: [],
        contenu: {},
        heritageProps: { 'prop-id': { etape: {}, actif: true } },
        heritageContenu: {
          'section-id': { 'element-id': { etape: {}, actif: true } },
        },
      })
    ).toEqual({
      amodiataires: [],
      duree: 10,
      id: 'etape-id',
      statutId: '',
      substances: [],
      titreDemarcheId: 'demarche-id',
      titulaires: [],
      heritageProps: { 'prop-id': { actif: true } },
      heritageContenu: {
        'section-id': { 'element-id': { actif: true } },
      },
      typeId: 'mfr',
    })

    expect(
      etapeSaveFormat({
        id: 'etape-id',
        titreDemarcheId: 'demarche-id',
        type: { id: 'etape-type-id' },
        statutId: 'etape-statut-id',
        duree: 240,
        amodiataires: [],
        titulaires: [{ id: 'titulaire-id' }, { id: '' }],
        geoSystemeIds: ['geo-systeme-id'],
        geoSystemeOpposableId: '',
        groupes: [
          [
            [
              {
                references: {
                  'geo-systeme-id': { id: '1', x: 1.5, y: null },
                },
                lot: undefined,
                subsidiaire: undefined,
              },
              {
                references: { 'geo-systeme-id': { id: '2', x: 1.5, y: 1 } },
                lot: undefined,
                subsidiaire: undefined,
              },
              {
                description: undefined,
                references: [
                  { id: '3', x: 1.5, y: 3 },
                  { id: '4', x: 1.5, y: 4 },
                ],
                lot: 1,
                subsidiaire: undefined,
              },
              {
                description: undefined,
                references: [],
                lot: 2,
                subsidiaire: undefined,
              },
              {
                description: undefined,
                references: ['reference invalide'],
                lot: 3,
                subsidiaire: undefined,
              },
            ],
          ],
          [[]],
        ],
        substances: ['substance-id-1', undefined],
        contenu: { 'prop-id': 'prop-value' },
        documents: [{ id: 'tmp', typeId: 'tmp' }, { id: 'doc-id' }],
      })
    ).toEqual({
      amodiataires: [],
      contenu: { 'prop-id': 'prop-value' },
      duree: 240,
      id: 'etape-id',
      statutId: 'etape-statut-id',
      substances: ['substance-id-1'],
      titreDemarcheId: 'demarche-id',
      titulaires: [{ id: 'titulaire-id' }],
      typeId: 'etape-type-id',
      documentIds: ['doc-id'],
    })
  })
})
