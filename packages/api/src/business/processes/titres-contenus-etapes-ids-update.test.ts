import { ITitreEtape } from '../../types.js'

import { titresContenusEtapesIdsUpdate } from './titres-contenus-etapes-ids-update.js'
import { titreContenuTitreEtapeFind } from '../rules/titre-prop-etape-find.js'
import { titresGet } from '../../database/queries/titres.js'
import Titres from '../../database/models/titres.js'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres', () => ({
  titreUpdate: vi.fn().mockResolvedValue(true),
  titresGet: vi.fn(),
}))

vi.mock('../rules/titre-prop-etape-find', () => ({
  titreContenuTitreEtapeFind: vi.fn(),
}))

const titresGetMock = vi.mocked(titresGet, true)
const titreContenuTitreEtapeFindMock = vi.mocked(titreContenuTitreEtapeFind, true)

console.info = vi.fn()

describe("propriétés (contenu) d'un titre", () => {
  test('ajoute 2 nouvelles propriétés dans les props du titre', async () => {
    titreContenuTitreEtapeFindMock.mockReturnValue({
      id: 'etape-id',
    } as ITitreEtape)
    titresGetMock.mockResolvedValue([
      {
        type: {
          contenuIds: [
            { sectionId: 'arm', elementId: 'mecanise' },
            { sectionId: 'arm', elementId: 'agent' },
          ],
        },
      } as unknown as Titres,
    ])

    const titresUpdatedRequests = await titresContenusEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
  })

  test('ajoute 1 nouvelle propriété dans les props du titre', async () => {
    titreContenuTitreEtapeFindMock.mockReturnValue({
      id: 'etape-id',
    } as ITitreEtape)
    titresGetMock.mockResolvedValue([
      {
        type: {
          contenuIds: [{ sectionId: 'arm', elementId: 'mecanise' }],
        },
        contenusTitreEtapesIds: {},
      } as unknown as Titres,
    ])

    const titresUpdatedRequests = await titresContenusEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
  })

  test('met à jour 1 propriété dans les props du titre', async () => {
    titreContenuTitreEtapeFindMock.mockReturnValue({
      id: 'new-etape-id',
    } as ITitreEtape)
    titresGetMock.mockResolvedValue([
      {
        type: {
          contenuIds: [{ sectionId: 'arm', elementId: 'mecanise' }],
        },
        contenusTitreEtapesIds: { arm: { mecanise: 'old-etape-id' } },
      } as unknown as Titres,
    ])

    const titresUpdatedRequests = await titresContenusEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
  })

  test('ne met pas à jour de propriété dans les props du titre', async () => {
    titreContenuTitreEtapeFindMock.mockReturnValue({
      id: 'etape-id',
    } as ITitreEtape)
    titresGetMock.mockResolvedValue([
      {
        type: {
          contenuIds: [{ sectionId: 'arm', elementId: 'mecanise' }],
        },
        contenusTitreEtapesIds: { arm: { mecanise: 'etape-id' } },
      } as unknown as Titres,
    ])

    const titresUpdatedRequests = await titresContenusEtapesIdsUpdate()
    expect(titresUpdatedRequests.length).toEqual(0)
  })

  test('efface 1 propriété dans les props du titre', async () => {
    titreContenuTitreEtapeFindMock.mockReturnValue(null)
    titresGetMock.mockResolvedValue([
      {
        type: {
          contenuIds: [{ sectionId: 'arm', elementId: 'mecanise' }],
        },
        contenusTitreEtapesIds: { arm: { mecanise: 'etape-id' } },
      } as unknown as Titres,
    ])

    const titresUpdatedRequests = await titresContenusEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
  })

  test('efface 1 section dans les props du titre', async () => {
    titreContenuTitreEtapeFindMock.mockReturnValue(null)
    titresGetMock.mockResolvedValue([
      {
        type: {
          contenuIds: [{ sectionId: 'arm', elementId: 'mecanise' }],
        },
        contenusTitreEtapesIds: {
          arm: {
            mecanise: 'etape-id',
            xxx: { facture: 'etape-id' },
          },
        },
      } as unknown as Titres,
    ])

    const titresUpdatedRequests = await titresContenusEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
  })

  test("ne met pas à jour un titre qui n'a pas de configuration de props", async () => {
    titreContenuTitreEtapeFindMock.mockReturnValue(null)
    titresGetMock.mockResolvedValue([{ type: { contenuIds: null } } as unknown as Titres])

    const titresUpdatedRequests = await titresContenusEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(0)
  })
})