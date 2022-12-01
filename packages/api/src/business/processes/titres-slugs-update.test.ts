import Titres from '../../database/models/titres.js'
import { titresSlugsUpdate } from './titres-slugs-update.js'

import { titreSlugAndRelationsUpdate } from '../utils/titre-slug-and-relations-update.js'
import { titresGet } from '../../database/queries/titres.js'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../utils/titre-slug-and-relations-update', () => ({
  __esModule: true,
  titreSlugAndRelationsUpdate: vi.fn()
}))

vi.mock('../../database/queries/titres', () => ({
  __esModule: true,
  titreIdUpdate: vi.fn().mockResolvedValue(true),
  titreGet: vi.fn().mockResolvedValue(true),
  titresGet: vi.fn().mockResolvedValue(true)
}))

const titresGetMock = vi.mocked(titresGet, true)
const titreSlugAndRelationsUpdateMock = vi.mocked(
  titreSlugAndRelationsUpdate,
  true
)

console.info = vi.fn()
console.error = vi.fn()

const titre = { slug: 'slug-old' } as Titres

describe("mise à jour du slug d'un titre", () => {
  test('met à jour le titre si le slug a changé', async () => {
    const slug = 'slug-new'

    titresGetMock.mockResolvedValue([titre])
    titreSlugAndRelationsUpdateMock.mockResolvedValue({
      hasChanged: true,
      slug
    })

    const titresUpdatedIndex = await titresSlugsUpdate()
    const titreSlug = titresUpdatedIndex && Object.keys(titresUpdatedIndex)[0]

    expect(titreSlug).toEqual(slug)

    expect(titreSlugAndRelationsUpdate).toHaveBeenCalled()
  })
})
