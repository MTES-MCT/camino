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
      substances: [],
      contenu: {},
      documents: [],
      justificatifs: [{ id: 'toto', nom: 'name' }],
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
        contenu: { 'prop-id': 'prop-value' },
        substances: ['auru'],
        documents: [{ typeId: 'aac' }],
      })
    ).toEqual({
      id: 'etape-id',
      typeId: 'aac',
      statutId: 'etape-statut-id',
      duree: 240,
      amodiataires: [],
      titulaires: [{ id: 'titulaire-id', operateur: false }],
      substances: ['auru'],
      contenu: { 'prop-id': 'prop-value' },
      documents: [{ fichierNouveau: null, typeId: 'aac' }],
    })
  })
})
