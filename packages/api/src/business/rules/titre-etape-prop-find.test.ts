import { ITitreDemarche } from '../../types.js'

import { titreEtapePropFind } from './titre-etape-prop-find.js'
import { vi, describe, expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
console.error = vi.fn()

describe("valeur d'une propriété pour une étape", () => {
  const date = toCaminoDate('2020-12-01')

  test('retourne null si le titre ne contient pas de démarches', () => {
    expect(titreEtapePropFind('titulaires', date, [] as unknown as ITitreDemarche[], 'pxm')).toEqual(null)
  })

  test('retourne null si le titre ne contient pas de démarche avec des étapes', () => {
    expect(titreEtapePropFind('titulaires', date, [{}, { etapes: [] }] as unknown as ITitreDemarche[], 'pxm')).toEqual(null)
  })

  test("retourne la propriété de l'étape antérieure qui contient la propriété voulue", () => {
    expect(
      titreEtapePropFind(
        'titulaires',
        date,
        [
          {
            id: 'demarche-01',
            type: { id: 'oct' },
            typeId: 'oct',
            etapes: [
              {
                id: 'demarche-01-etape-01',
                typeId: 'aac',
                statutId: 'acc',
                date: toCaminoDate('1000-01-01'),
                titulaires: [],
                ordre: 1,
                communes: null,
                surface: null,
              },
              {
                id: 'demarche-01-etape-02',
                typeId: 'aac',
                statutId: 'acc',
                date: toCaminoDate('1000-01-01'),
                titulaires: [{ id: 'fr-xxxxxxxxx' }],
                ordre: 1,
                communes: null,
                surface: null,
              },
            ],
          },
        ] as ITitreDemarche[],
        'pxm'
      )
    ).toEqual([{ id: 'fr-xxxxxxxxx' }])
  })

  test("retourne la propriété de l'étape antérieure qui contient la propriété voulue", () => {
    expect(
      titreEtapePropFind(
        'surface',
        date,
        [
          {
            id: 'demarche-01',
            statutId: 'acc',
            type: { id: 'oct' },
            etapes: [
              {
                id: 'demarche-01-etape-01',
                typeId: 'aac',
                statutId: 'acc',
                surface: 0,
                ordre: 1,
                communes: null,
                date: '1000-01-01',
              },
            ],
          },
          {
            type: { id: 'oct' },
            typeId: 'oct',
            etapes: [
              {
                id: 'demarche-02-etape-01',
                date: '1000-01-01',
                typeId: 'aac',
                statutId: 'acc',
                surface: 0,
                ordre: 1,
                communes: null,
              },
            ],
          },
        ] as unknown as ITitreDemarche[],
        'pxm'
      )
    ).toEqual(0)
  })

  test("retourne null si la propriété n'a pas de valeur", () => {
    expect(
      titreEtapePropFind(
        'titulaires',
        date,
        [
          {
            id: 'demarche-01',
            typeId: 'oct',
            type: { id: 'oct' },
            etapes: [
              {
                id: 'demarche-02-etape-01',
                date: '1000-01-01',
                statutId: 'acc',
                titulaires: null,
                typeId: 'aac',
                surface: 0,
                ordre: 1,
                communes: null,
              },
            ],
          },
        ] as unknown as ITitreDemarche[],
        'pxm'
      )
    ).toBeNull()
  })
})
