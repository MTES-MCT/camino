import { etapeEditFormat } from './titre-etape-edit'
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

      substances: [],
      contenu: {},
    })

    expect(
      // @ts-ignore
      etapeEditFormat({
        id: etapeIdValidator.parse('etape-id'),
      })
    ).toEqual({
      id: 'etape-id',
      amodiataires: [],
      titulaires: [],
      substances: [],
      contenu: {},
    })

    expect(
      etapeEditFormat({
        id: etapeIdValidator.parse('etape-id'),
        typeId: 'aac',
        // @ts-ignore
        statutId: 'etape-statut-id',
        duree: 240,
        administrations: ['aut-97300-01'],
        titulaires: [{ id: newEntrepriseId('titulaire-id'), operateur: false }],
        contenu: { 'section-id': { 'element-id': 'prop-value' } },
        substances: ['auru'],
      })
    ).toEqual({
      id: 'etape-id',
      typeId: 'aac',
      statutId: 'etape-statut-id',
      duree: 240,
      amodiataires: [],
      titulaires: [{ id: 'titulaire-id', operateur: false }],
      substances: ['auru'],
      contenu: { 'section-id': { 'element-id': 'prop-value' } },
    })
  })
})
