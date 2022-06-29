import { uglySubstanceTrick } from './titres-etapes'

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
        { id: 'auru', ordre: 1 },
        { id: 'arge', ordre: 2 },
        { id: 'plat', ordre: 3 }
      ]
    }
    uglySubstanceTrick(0, initial)

    expect(initial.substances).toStrictEqual([
      { id: 'auru', ordre: 4 },
      { id: 'arge', ordre: 5 },
      { id: 'plat', ordre: 6 }
    ])
  })

  test('des substances déjà en base', () => {
    const initial = {
      substances: [
        { id: 'auru', ordre: 1 },
        { id: 'arge', ordre: 2 },
        { id: 'plat', ordre: 3 }
      ]
    }
    uglySubstanceTrick(6, initial)

    expect(initial.substances).toStrictEqual([
      { id: 'auru', ordre: 7 },
      { id: 'arge', ordre: 8 },
      { id: 'plat', ordre: 9 }
    ])
  })
})
