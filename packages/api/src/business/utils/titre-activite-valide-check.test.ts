import { ITitreDemarche } from '../../types.js'

import { titreActiviteValideCheck } from './titre-activite-valide-check.js'

import { titreValideCheck } from './titre-valide-check.js'

import { vi, describe, test, expect } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'

vi.mock('./titre-valide-check', () => ({
  titreValideCheck: vi.fn(),
}))

const titreValideCheckMock = vi.mocked(titreValideCheck, true)

describe('validité des activités', () => {
  test("retourne faux si la date de l'activité est après aujourd'hui", () => {
    expect(titreActiviteValideCheck(toCaminoDate('2020-04-01'), toCaminoDate('2020-01-01'), 1, 2020, 3, [] as ITitreDemarche[])).toEqual(false)
  })

  test("retourne faux si le titre n'est pas valide à cette date", () => {
    titreValideCheckMock.mockReturnValue(false)
    expect(titreActiviteValideCheck(toCaminoDate('2020-04-01'), toCaminoDate('2021-05-01'), 1, 2020, 3, [] as ITitreDemarche[])).toEqual(false)
  })

  test('retourne vrai si le titre est valide à cette date', () => {
    titreValideCheckMock.mockReturnValue(true)
    expect(titreActiviteValideCheck(toCaminoDate('2020-04-01'), toCaminoDate('2021-05-01'), 1, 2020, 3, [] as ITitreDemarche[])).toEqual(true)
  })
})
