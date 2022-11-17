import { titresDemarchesStatutIdUpdate } from './titres-demarches-statut-ids-update'
import { titresGet } from '../../database/queries/titres'

import {
  titresDemarchesStatutModifie,
  titresDemarchesStatutIdentique,
  titresDemarchesSansEtape
} from './__mocks__/titres-demarches-statut-ids-update-demarches'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres-demarches', () => ({
  titreDemarcheUpdate: vi.fn().mockResolvedValue(true)
}))

vi.mock('../../database/queries/titres', () => ({
  __esModule: true,
  titresGet: vi.fn()
}))

const titresGetMock = vi.mocked(titresGet, true)

console.info = vi.fn()

describe("statut des démarches d'un titre", () => {
  test("met à jour le statut d'une démarche", async () => {
    titresGetMock.mockResolvedValue(titresDemarchesStatutModifie)
    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate()

    expect(titresDemarchesStatutUpdated.length).toEqual(1)
  })

  test("ne met pas à jour le statut d'une démarche", async () => {
    titresGetMock.mockResolvedValue(titresDemarchesStatutIdentique)
    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate()

    expect(titresDemarchesStatutUpdated.length).toEqual(0)
  })

  test("ne met pas à jour le statut d'une démarche sans étape", async () => {
    titresGetMock.mockResolvedValue(titresDemarchesSansEtape)
    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate()

    expect(titresDemarchesStatutUpdated.length).toEqual(0)
  })
})
