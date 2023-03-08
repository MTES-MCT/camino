import { titresPhasesUpdate } from './titres-phases-update.js'
import { titrePhasesUpsert, titrePhasesDelete } from '../../database/queries/titres-phases.js'
import { titresGet } from '../../database/queries/titres.js'

import { titresSansPhase, titresUnePhase, titresPhaseASupprimer, titresUnePhaseSansChangement, titresUnePhaseMiseAJour, titrePhase } from './__mocks__/titres-phases-update-titres.js'
import { vi, afterEach, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres-phases', () => ({
  titrePhasesUpsert: vi.fn().mockResolvedValue(true),
  titrePhasesDelete: vi.fn().mockResolvedValue(true),
}))

vi.mock('../../database/queries/titres', () => ({
  titresGet: vi.fn(),
}))

const titresGetMock = vi.mocked(titresGet, true)

console.info = vi.fn()

afterEach(() => {
  vi.resetAllMocks()
})
describe("phases d'un titre", () => {
  test('met à jour un titre dont une phase est créée', async () => {
    titresGetMock.mockResolvedValue(titresUnePhase)

    const [titresPhasesUpdated, titresPhasesDeleted] = await titresPhasesUpdate()

    expect(titresPhasesUpdated.length).toEqual(1)
    expect(titresPhasesDeleted.length).toEqual(0)

    expect(titrePhasesUpsert).toHaveBeenCalledWith(titrePhase)
  })

  test('met à jour un titre dont une phase est modifiée', async () => {
    titresGetMock.mockResolvedValue(titresUnePhaseMiseAJour)
    const [titresPhasesUpdated, titresPhasesDeleted] = await titresPhasesUpdate()

    expect(titresPhasesUpdated.length).toEqual(1)
    expect(titresPhasesDeleted.length).toEqual(0)

    expect(titrePhasesUpsert).toHaveBeenCalledWith(titrePhase)
  })

  test('met à jour un titre dont une phase est supprimée', async () => {
    titresGetMock.mockResolvedValue(titresPhaseASupprimer)
    const [titresPhasesUpdated, titresPhasesDeleted] = await titresPhasesUpdate()

    expect(titresPhasesUpdated.length).toEqual(0)
    expect(titresPhasesDeleted.length).toEqual(1)

    expect(titrePhasesDelete).toHaveBeenCalledWith(['h-cx-courdemanges-1988-oct01'])
  })

  test("ne met pas à jour un titre si aucune phase n'est modifiée", async () => {
    titresGetMock.mockResolvedValue(titresUnePhaseSansChangement)
    const [titresPhasesUpdated, titresPhasesDeleted] = await titresPhasesUpdate()

    expect(titresPhasesUpdated.length).toEqual(0)
    expect(titresPhasesDeleted.length).toEqual(0)

    expect(titrePhasesDelete).not.toHaveBeenCalled()
    expect(titrePhasesUpsert).not.toHaveBeenCalled()
  })

  test("ne met pas à jour un titre si aucune phase n'existe", async () => {
    titresGetMock.mockResolvedValue(titresSansPhase)
    const [titresPhasesUpdated, titresPhasesDeleted] = await titresPhasesUpdate()

    expect(titresPhasesUpdated.length).toEqual(0)
    expect(titresPhasesDeleted.length).toEqual(0)

    expect(titrePhasesDelete).not.toHaveBeenCalled()
    expect(titrePhasesUpsert).not.toHaveBeenCalled()
  })
})
