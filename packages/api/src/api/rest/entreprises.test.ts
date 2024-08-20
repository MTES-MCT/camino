import Decimal from 'decimal.js'
import { responseExtractor } from './entreprises'
import { describe, expect, test } from 'vitest'

describe("extrait la réponse venant des matrices", () => {
  test('récupère les bonnes valeurs', () => {
    expect(
      responseExtractor(
        [{
          fiscalite: {
            redevanceCommunale: new Decimal(6604.6),
            redevanceDepartementale: new Decimal(1318.54),
          },
        }],
      )
    ).toStrictEqual({
      redevanceCommunale: new Decimal(6604.6),
      redevanceDepartementale: new Decimal(1318.54),
    })
  })
})
