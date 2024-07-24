import { test, expect } from 'vitest'
import { etapeDocumentIdValidator, getStatutId } from './etape'
import { ETAPES_STATUTS } from './static/etapesStatuts'
import { caminoDateValidator } from './date'
import { ETAPES_TYPES } from './static/etapesTypes'

test('documentIdValidator', () => {
  expect(() => etapeDocumentIdValidator.parse('2021-01-01-kbi-ac123457')).not.toThrowError()
})

test('getStatutId', () => {
  expect(
    getStatutId({ typeId: ETAPES_TYPES.recevabilite, date: caminoDateValidator.parse('2020-01-01'), statutId: ETAPES_STATUTS.ACCEPTE, contenu: {} }, caminoDateValidator.parse('2020-01-01'))
  ).toBe(ETAPES_STATUTS.ACCEPTE)

  expect(
    getStatutId(
      {
        typeId: ETAPES_TYPES.participationDuPublic,
        date: caminoDateValidator.parse('2020-07-14'),
        statutId: ETAPES_STATUTS.ACCEPTE,
        contenu: { opdp: { duree: { value: 15, etapeHeritee: null, heritee: false } } },
      },
      caminoDateValidator.parse('2020-07-14')
    )
  ).toBe(ETAPES_STATUTS.EN_COURS)

  expect(
    getStatutId(
      {
        typeId: ETAPES_TYPES.participationDuPublic,
        date: caminoDateValidator.parse('2020-07-14'),
        statutId: ETAPES_STATUTS.ACCEPTE,
        contenu: { opdp: { duree: { value: 15, etapeHeritee: null, heritee: false } } },
      },
      caminoDateValidator.parse('2020-07-13')
    )
  ).toBe(ETAPES_STATUTS.PROGRAMME)

  expect(
    getStatutId(
      {
        typeId: ETAPES_TYPES.participationDuPublic,
        date: caminoDateValidator.parse('2020-07-14'),
        statutId: ETAPES_STATUTS.ACCEPTE,
        contenu: { opdp: { duree: { value: 15, etapeHeritee: null, heritee: false } } },
      },
      caminoDateValidator.parse('2020-07-29')
    )
  ).toBe(ETAPES_STATUTS.TERMINE)

  expect(
    getStatutId(
      {
        typeId: ETAPES_TYPES.participationDuPublic,
        date: caminoDateValidator.parse('2020-07-14'),
        statutId: ETAPES_STATUTS.ACCEPTE,
        contenu: { opdp: { duree: { value: 15, etapeHeritee: null, heritee: false } } },
      },
      caminoDateValidator.parse('2020-07-28')
    )
  ).toBe(ETAPES_STATUTS.EN_COURS)
})
