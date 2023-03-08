import { titresPointsReferencesCreate } from './titres-points-references-create.js'
import { titresPointsGet, titrePointReferenceCreate } from '../../database/queries/titres-points.js'
import TitresPoints from '../../database/models/titres-points.js'
import { vi, afterEach, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres-points', () => ({
  titrePointReferenceCreate: vi.fn().mockResolvedValue(true),
  titresPointsGet: vi.fn(),
}))

const titresPointsGetMock = vi.mocked(titresPointsGet, true)

console.info = vi.fn()

afterEach(() => {
  vi.resetAllMocks()
})
describe("références des points d'un titre", () => {
  test('crée une référence sur un point si elle est absente', async () => {
    titresPointsGetMock.mockResolvedValue([
      { id: 'point-id', coordonnees: { x: 0.1, y: 0.2 } },
      {
        id: 'point-id-2',
        coordonnees: { x: 0.1, y: 0.2 },
        references: [{}],
      },
    ] as TitresPoints[])

    const pointsReferencesCreated = await titresPointsReferencesCreate()

    expect(pointsReferencesCreated.length).toEqual(1)
  })

  test("ne crée pas de référence sur un titre qui n'a pas de point", async () => {
    titresPointsGetMock.mockResolvedValue([] as TitresPoints[])

    const pointsReferencesCreated = await titresPointsReferencesCreate()

    expect(pointsReferencesCreated.length).toEqual(0)

    expect(titrePointReferenceCreate).not.toHaveBeenCalled()
  })
})
