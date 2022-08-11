import { uglySubstanceTrick } from './titres-etapes'
import { SUBSTANCES_LEGALES_IDS } from 'camino-common/src/static/substancesLegales'

describe('uglySubstanceTrick', () => {
  test('pas de substances', () => {
    const initial = {}
    const tested = { ...initial }

    uglySubstanceTrick(0, tested)
    expect(tested).toStrictEqual(initial)
  })

  test('des substances', () => {
    const initial = {
      substances: [
        { substanceId: SUBSTANCES_LEGALES_IDS.or, ordre: 1 },
        { substanceId: SUBSTANCES_LEGALES_IDS.argent, ordre: 2 },
        { substanceId: SUBSTANCES_LEGALES_IDS.platine, ordre: 3 }
      ]
    }
    uglySubstanceTrick(0, initial)

    expect(initial.substances).toStrictEqual([
      { substanceId: SUBSTANCES_LEGALES_IDS.or, ordre: 4 },
      { substanceId: SUBSTANCES_LEGALES_IDS.argent, ordre: 5 },
      { substanceId: SUBSTANCES_LEGALES_IDS.platine, ordre: 6 }
    ])
  })

  test('des substances déjà en base', () => {
    const initial = {
      substances: [
        { substanceId: SUBSTANCES_LEGALES_IDS.or, ordre: 1 },
        { substanceId: SUBSTANCES_LEGALES_IDS.argent, ordre: 2 },
        { substanceId: SUBSTANCES_LEGALES_IDS.platine, ordre: 3 }
      ]
    }
    uglySubstanceTrick(6, initial)

    expect(initial.substances).toStrictEqual([
      { substanceId: SUBSTANCES_LEGALES_IDS.or, ordre: 7 },
      { substanceId: SUBSTANCES_LEGALES_IDS.argent, ordre: 8 },
      { substanceId: SUBSTANCES_LEGALES_IDS.platine, ordre: 9 }
    ])
  })
})
