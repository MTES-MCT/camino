import { etapeSaveFormat } from './titre-etape-save'
import { describe, expect, test } from 'vitest'

// dateFormat
describe('etapeSaveFormat', () => {
  test("formate une étape pour l'enregistrer", () => {
    expect(
      etapeSaveFormat({
        id: 'etape-id',
        titreDemarcheId: 'demarche-id',
        typeId: 'mfr',
        statutId: '',
        dateFin: '',
        duree: null,
        amodiataires: [],
        titulaires: [],
        substances: [],
        contenu: {},
      })
    ).toEqual({
      amodiataires: [],
      duree: null,
      dateFin: null,
      id: 'etape-id',
      statutId: '',
      substances: [],
      titreDemarcheId: 'demarche-id',
      titulaires: [],
      typeId: 'mfr',
    })

    expect(
      etapeSaveFormat({
        id: 'etape-id',
        typeId: 'mfr',
        titreDemarcheId: 'demarche-id',
        statutId: '',
        duree: 10,
        amodiataires: [],
        titulaires: [],
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
        typeId: 'mfr',
        statutId: 'etape-statut-id',
        duree: 240,
        amodiataires: [],
        titulaires: [{ id: 'titulaire-id' }, { id: '' }],

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
      typeId: 'mfr',
      documentIds: ['doc-id'],
    })
  })
})
