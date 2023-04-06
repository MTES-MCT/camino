import { entreprisesUpdate } from './entreprises-update.js'
import { entreprisesGet } from '../../database/queries/entreprises.js'
import { entreprisesEtablissementsGet } from '../../database/queries/entreprises-etablissements.js'
import { apiInseeEntreprisesGet, apiInseeEntreprisesEtablissementsGet } from '../../tools/api-insee/index.js'
import { IEntreprise, IEntrepriseEtablissement } from '../../types.js'
import { vi, beforeEach, describe, expect, test } from 'vitest'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import Entreprises from '../../database/models/entreprises.js'
import EntreprisesEtablissements from '../../database/models/entreprises-etablissements.js'

const entreprisesUpdated: IEntreprise[] = []
// 'vi.mock()` est hoisté avant l'import, le court-circuitant
// https://vijs.io/docs/en/vi-object#vidomockmodulename-factory-options
vi.mock('../../database/queries/entreprises', () => ({
  entreprisesUpsert: vi.fn().mockImplementation(a => {
    entreprisesUpdated.push(...a)

    return a
  }),
  entreprisesGet: vi.fn(),
}))

const etablissementsUpdated: IEntrepriseEtablissement[] = []
const etablissementsDeleted: string[] = []
vi.mock('../../database/queries/entreprises-etablissements', () => ({
  entreprisesEtablissementsUpsert: vi.fn().mockImplementation(a => {
    etablissementsUpdated.push(...a)

    return a
  }),
  entreprisesEtablissementsDelete: vi.fn().mockImplementation(a => {
    etablissementsDeleted.push(...a)

    return a
  }),
  entreprisesEtablissementsGet: vi.fn(),
}))

// 'vi.mock()' est hoisté avant l'import, le court-circuitant
// https://vijs.io/docs/en/vi-object#vidomockmodulename-factory-options
vi.mock('../../tools/api-insee/index', () => ({
  __esModule: true,
  apiInseeEntreprisesGet: vi.fn(),
  apiInseeEntreprisesEtablissementsGet: vi.fn(),
}))

const entreprisesGetMock = vi.mocked(entreprisesGet, true)
const entreprisesEtablissementsGetMock = vi.mocked(entreprisesEtablissementsGet, true)
const apiInseeEntreprisesGetMock = vi.mocked(apiInseeEntreprisesGet, true)
const apiInseeEntreprisesEtablissementsGetMock = vi.mocked(apiInseeEntreprisesEtablissementsGet, true)

console.info = vi.fn()
console.info = vi.fn()

describe('entreprises', () => {
  beforeEach(() => {
    etablissementsUpdated.splice(0, etablissementsUpdated.length)
    etablissementsDeleted.splice(0, etablissementsDeleted.length)
    entreprisesUpdated.splice(0, entreprisesUpdated.length)
  })
  test("crée les entreprises si elles n'existent pas", async () => {
    entreprisesGetMock.mockResolvedValue([
      { id: 'pipo', legalSiren: undefined, nom: 'pipo' },
      { id: 'toto', legalSiren: '123456789', nom: 'toto' },
      { id: 'nunu', legalSiren: '123456789', nom: 'nunu' },
    ] as Entreprises[])
    entreprisesEtablissementsGetMock.mockResolvedValue([])
    apiInseeEntreprisesGetMock.mockResolvedValue([{ id: 'papa', legalSiren: '123456789' }] as Entreprises[])
    apiInseeEntreprisesEtablissementsGetMock.mockResolvedValue([
      { id: 'pipo', nom: 'pipo' },
      { id: 'toto', nom: 'toto' },
    ] as EntreprisesEtablissements[])

    await entreprisesUpdate()

    expect(etablissementsUpdated).toEqual([
      { id: 'pipo', nom: 'pipo' },
      { id: 'toto', nom: 'toto' },
    ])
    expect(etablissementsDeleted.length).toEqual(0)
    expect(entreprisesUpdated).toEqual([{ id: 'papa', legalSiren: '123456789' }])
  })

  test('met à jour les entreprises qui ont été modifiées', async () => {
    entreprisesGetMock.mockResolvedValue([{ id: 'toto', legalSiren: '987654321', nom: 'toto' }] as Entreprises[])
    entreprisesEtablissementsGetMock.mockResolvedValue([{ id: 'toto', nom: 'toto' }] as EntreprisesEtablissements[])
    apiInseeEntreprisesGetMock.mockResolvedValue([{ id: 'toto', legalSiren: '123456789' }] as Entreprises[])
    apiInseeEntreprisesEtablissementsGetMock.mockResolvedValue([{ id: 'toto', nom: 'tutu' }] as EntreprisesEtablissements[])

    await entreprisesUpdate()

    expect(etablissementsUpdated).toEqual([{ id: 'toto', nom: 'tutu' }])
    expect(etablissementsDeleted.length).toEqual(0)
    expect(entreprisesUpdated).toEqual([{ id: 'toto', legalSiren: '123456789' }])
    expect(console.info).toHaveBeenCalled()
  })

  test('supprime les entreprises qui ont été supprimés', async () => {
    entreprisesGetMock.mockResolvedValue([{ id: 'papa', legalSiren: '987654321', nom: 'toto' }] as Entreprises[])
    entreprisesEtablissementsGetMock.mockResolvedValue([
      {
        id: 'papa',
        dateDebut: '2000-01-01',
        entrepriseId: 'toto',
      },
    ] as EntreprisesEtablissements[])
    apiInseeEntreprisesGetMock.mockResolvedValue([])
    apiInseeEntreprisesEtablissementsGetMock.mockResolvedValue([])

    await entreprisesUpdate()

    expect(etablissementsUpdated.length).toEqual(0)
    expect(etablissementsDeleted.length).toEqual(1)
    expect(entreprisesUpdated.length).toEqual(0)
    expect(console.info).toHaveBeenCalled()
  })

  test('ne crée pas les entreprises qui existent déjà', async () => {
    entreprisesGetMock.mockResolvedValue([{ id: newEntrepriseId('toto'), legalSiren: '123456789', nom: 'toto' }] as Entreprises[])
    entreprisesEtablissementsGetMock.mockResolvedValue([
      {
        id: 'toto',
        dateDebut: '2000-01-01',
        entrepriseId: 'toto',
      },
    ] as EntreprisesEtablissements[])
    apiInseeEntreprisesGetMock.mockResolvedValue([{ id: 'toto', legalSiren: '123456789', nom: 'toto' }] as Entreprises[])
    apiInseeEntreprisesEtablissementsGetMock.mockResolvedValue([
      {
        id: 'toto',
        dateDebut: '2000-01-01',
        entrepriseId: 'toto',
      },
    ] as EntreprisesEtablissements[])

    await entreprisesUpdate()

    expect(entreprisesUpdated).toEqual([])
    expect(etablissementsDeleted.length).toEqual(0)
    expect(etablissementsUpdated).toEqual([])
  })

  test("ne modifie pas d'entreprises si elles n'existent pas", async () => {
    entreprisesGetMock.mockResolvedValue([])
    entreprisesEtablissementsGetMock.mockResolvedValue([])
    apiInseeEntreprisesGetMock.mockResolvedValue([])
    apiInseeEntreprisesEtablissementsGetMock.mockResolvedValue([])

    await entreprisesUpdate()

    expect(etablissementsUpdated.length).toEqual(0)
    expect(etablissementsDeleted.length).toEqual(0)
    expect(entreprisesUpdated.length).toEqual(0)
  })
})
