import { ITitreDemarche } from '../../types'

import { titreEtapePropFind } from './titre-etape-prop-find'
import { vi, describe, expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date'
import { ETAPE_IS_NOT_BROUILLON, etapeIdValidator } from 'camino-common/src/etape'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { demarcheIdValidator } from 'camino-common/src/demarche'
import { ZERO_KM2 } from 'camino-common/src/number'
import { newEntrepriseId } from 'camino-common/src/entreprise'
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
                concurrence: 'non-applicable',
                demarcheIdsConsentement: [],
                hasTitreFrom: 'non-applicable',
              },
              {
                id: etapeIdValidator.parse('demarche-01-etape-02'),
                titreDemarcheId: demarcheId,
                typeId: 'asc',
                statutId: 'fai',
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                date: toCaminoDate('1000-01-01'),
                titulaireIds: [newEntrepriseId('fr-xxxxxxxxx')],
                ordre: 1,
                communes: null,
                surface: null,
                concurrence: 'non-applicable',
                demarcheIdsConsentement: [],
                hasTitreFrom: 'non-applicable',
              },
            ],
          },
        ],
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
                surface: ZERO_KM2,
                ordre: 1,
                communes: null,
                date: toCaminoDate('1000-01-01'),
                demarcheIdsConsentement: [],
                concurrence: 'non-applicable',
                hasTitreFrom: 'non-applicable',
              },
            ],
          },
          {
            id: demarcheIdValidator.parse('demarche-02'),
            titreId: titreIdValidator.parse('titreId'),
            statutId: 'acc',
            typeId: 'oct',
            etapes: [
              {
                id: etapeIdValidator.parse('demarche-02-etape-01'),
                titreDemarcheId: demarcheIdValidator.parse('demarche-02'),
                date: toCaminoDate('1000-01-01'),
                typeId: 'asc',
                statutId: 'fai',
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                surface: ZERO_KM2,
                ordre: 1,
                communes: null,
                demarcheIdsConsentement: [],
                concurrence: 'non-applicable',
                hasTitreFrom: 'non-applicable',
              },
            ],
          },
        ],
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
                surface: ZERO_KM2,
                ordre: 1,
                communes: null,
                demarcheIdsConsentement: [],
                concurrence: 'non-applicable',
                hasTitreFrom: 'non-applicable',
              },
            ],
          },
        ],
        'pxm'
      )
    ).toBeNull()
  })
})
