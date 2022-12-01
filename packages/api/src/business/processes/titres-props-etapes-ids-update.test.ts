import { ITitreEtape } from '../../types.js'

import { titresPropsEtapesIdsUpdate } from './titres-props-etapes-ids-update.js'
import { titrePropTitreEtapeFind } from '../rules/titre-prop-etape-find.js'
import { titresGet } from '../../database/queries/titres.js'
import Titres from '../../database/models/titres.js'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres', () => ({
  titreUpdate: vi.fn().mockResolvedValue(true),
  titresGet: vi.fn()
}))

vi.mock('../rules/titre-prop-etape-find', () => ({
  titrePropTitreEtapeFind: vi.fn()
}))

const titresGetMock = vi.mocked(titresGet, true)
const titrePropTitreEtapeFindMock = vi.mocked(titrePropTitreEtapeFind, true)

console.info = vi.fn()

describe("propriétés (étape) d'un titre", () => {
  test('trouve 8 propriétés dans les étapes', async () => {
    titrePropTitreEtapeFindMock.mockReturnValue({
      id: 'etape-id'
    } as ITitreEtape)
    titresGetMock.mockResolvedValue([
      { propsTitreEtapesIds: { titulaires: null } } as unknown as Titres
    ])

    const titresUpdatedRequests = await titresPropsEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
    expect(console.info).toHaveBeenCalled()
  })

  test("supprime un id d'étape qui est null dans les étapes", async () => {
    titrePropTitreEtapeFindMock.mockReturnValue(null)
    titresGetMock.mockResolvedValue([
      { propsTitreEtapesIds: { titulaires: null } } as unknown as Titres
    ])

    const titresUpdatedRequests = await titresPropsEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
  })

  test('ne trouve pas de propriétés dans les étapes', async () => {
    titrePropTitreEtapeFindMock.mockReturnValue(null)
    titresGetMock.mockResolvedValue([
      { propsTitreEtapesIds: {} } as unknown as Titres
    ])

    const titresUpdatedRequests = await titresPropsEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(0)
  })
})
