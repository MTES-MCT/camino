import { ITitreDemarche } from '../../types.js'

import { titreEtapePropFind } from './titre-etape-prop-find.js'
import { vi, describe, expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
import { ETAPE_IS_NOT_BROUILLON, etapeIdValidator } from 'camino-common/src/etape.js'
import { titreIdValidator } from 'camino-common/src/validators/titres.js'
import { demarcheIdValidator } from 'camino-common/src/demarche.js'
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
    const demarcheId = demarcheIdValidator.parse('demarche-01')
    expect(
      titreEtapePropFind(
        'titulaires',
        date,
        [
          {
            id: demarcheId,
            titreId: titreIdValidator.parse('titreId'),
            typeId: 'oct',
            etapes: [
              {
                id: etapeIdValidator.parse('demarche-01-etape-01'),
                titreDemarcheId: demarcheId,
                typeId: 'asc',
                statutId: 'fai',
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('1000-01-01'),
                titulaireIds: [],
                ordre: 1,
                communes: null,
                surface: null,
              },
              {
                id: etapeIdValidator.parse('demarche-01-etape-02'),
                titreDemarcheId: demarcheId,
                typeId: 'asc',
                statutId: 'fai',
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('1000-01-01'),
                titulaireIds: ['fr-xxxxxxxxx'],
                ordre: 1,
                communes: null,
                surface: null,
              },
            ],
          },
        ] as ITitreDemarche[],
        'pxm'
      )
    ).toEqual(['fr-xxxxxxxxx'])
  })

  test("retourne la propriété de l'étape antérieure qui contient la propriété voulue", () => {
    expect(
      titreEtapePropFind(
        'surface',
        date,
        [
          {
            id: demarcheIdValidator.parse('demarche-01'),
            titreId: titreIdValidator.parse('titreId'),
            statutId: 'acc',
            typeId: 'oct',
            etapes: [
              {
                id: etapeIdValidator.parse('demarche-01-etape-01'),
                titreDemarcheId: demarcheIdValidator.parse('demarche-01'),
                typeId: 'asc',
                statutId: 'fai',
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                surface: 0,
                ordre: 1,
                communes: null,
                date: toCaminoDate('1000-01-01'),
              },
            ],
          },
          {
            typeId: 'oct',
            etapes: [
              {
                id: etapeIdValidator.parse('demarche-02-etape-01'),
                date: toCaminoDate('1000-01-01'),
                typeId: 'asc',
                statutId: 'fai',
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                surface: 0,
                ordre: 1,
                communes: null,
              },
            ],
          },
        ] as ITitreDemarche[],
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
            id: demarcheIdValidator.parse('demarche-01'),
            titreId: titreIdValidator.parse('titreId'),
            typeId: 'oct',
            etapes: [
              {
                id: etapeIdValidator.parse('demarche-02-etape-01'),
                titreDemarcheId: demarcheIdValidator.parse('demarche-01'),
                date: toCaminoDate('1000-01-01'),
                statutId: 'fai',
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                titulaireIds: null,
                typeId: 'asc',
                surface: 0,
                ordre: 1,
                communes: null,
              },
            ],
          },
        ] as ITitreDemarche[],
        'pxm'
      )
    ).toBeNull()
  })
})
