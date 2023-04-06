import { titresDemarchesDatesUpdate } from './titres-phases-update.js'
import { titresGet } from '../../database/queries/titres.js'

import { titresSansPhase, titresUnePhase, titresPhaseASupprimer, titresUnePhaseSansChangement, titresUnePhaseMiseAJour, titrePhase } from './__mocks__/titres-phases-update-titres.js'
import { vi, afterEach, describe, expect, test } from 'vitest'


vi.mock('../../database/queries/titres', () => ({
  titresGet: vi.fn(),
}))
vi.mock('../../knex', () => ({
  knex: { raw: vi.fn()}
}))

const titresGetMock = vi.mocked(titresGet, true)

console.info = vi.fn()

afterEach(() => {
  vi.resetAllMocks()
})
describe("phases d'un titre", () => {
  test('met à jour un titre dont une phase est créée', async () => {
    titresGetMock.mockResolvedValue(titresUnePhase)

    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate()

    expect(titresDemarchesDatesUpdated.length).toEqual(1)

  })

  test('met à jour un titre dont une phase est modifiée', async () => {
    titresGetMock.mockResolvedValue(titresUnePhaseMiseAJour)
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate()

    expect(titresDemarchesDatesUpdated.length).toEqual(1)

  })

  test('met à jour un titre dont une phase est supprimée', async () => {
    titresGetMock.mockResolvedValue(titresPhaseASupprimer)
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate()

    expect(titresDemarchesDatesUpdated.length).toEqual(1)

  })

  test("ne met pas à jour un titre si aucune phase n'est modifiée", async () => {
    titresGetMock.mockResolvedValue(titresUnePhaseSansChangement)
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate()

    expect(titresDemarchesDatesUpdated.length).toEqual(1)

  })

  test("ne met pas à jour un titre si aucune phase n'existe", async () => {
    titresGetMock.mockResolvedValue(titresSansPhase)
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate()

    expect(titresDemarchesDatesUpdated.length).toEqual(1)

  })
})
