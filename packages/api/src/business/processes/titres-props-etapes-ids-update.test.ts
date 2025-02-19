import { ITitre, ITitreEtape } from '../../types'

import { titresPropsEtapesIdsUpdate } from './titres-props-etapes-ids-update'
import { titrePropTitreEtapeFind } from '../rules/titre-prop-etape-find'
import { titresGet } from '../../database/queries/titres'
import { vi, describe, expect, test } from 'vitest'
import { newTitreId } from '../../database/models/_format/id-create'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
vi.mock('../../database/queries/titres', () => ({
  titreUpdate: vi.fn().mockResolvedValue(true),
  titresGet: vi.fn(),
}))

vi.mock('../rules/titre-prop-etape-find', () => ({
  titrePropTitreEtapeFind: vi.fn(),
}))

const titresGetMock = vi.mocked(titresGet, true)
const titrePropTitreEtapeFindMock = vi.mocked(titrePropTitreEtapeFind, true)

console.info = vi.fn()

describe("propriétés (étape) d'un titre", () => {
  test('trouve 8 propriétés dans les étapes', async () => {
    titrePropTitreEtapeFindMock.mockReturnValue({
      id: 'etape-id',
    } as ITitreEtape)
    const titre: ITitre = {
      id: newTitreId('plop'),
      nom: 'nom titre',
      titreStatutId: TitresStatutIds.Valide,
      typeId: TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
      propsTitreEtapesIds: {
        // @ts-ignore 2025-02-13 je ne sais pas pourquoi ce test est là...
        titulaires: null,
      },
      demarches: [],
    }
    titresGetMock.mockResolvedValue([titre])

    const titresUpdatedRequests = await titresPropsEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
    expect(console.info).toHaveBeenCalled()
  })

  test("supprime un id d'étape qui est null dans les étapes", async () => {
    titrePropTitreEtapeFindMock.mockReturnValue(null)
    const titre: ITitre = {
      id: newTitreId('plop'),
      nom: 'nom titre',
      titreStatutId: TitresStatutIds.Valide,
      typeId: TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
      propsTitreEtapesIds: {
        // @ts-ignore 2025-02-13 je ne sais pas pourquoi ce test est là...
        titulaires: null,
      },
      demarches: [],
    }
    titresGetMock.mockResolvedValue([titre])

    const titresUpdatedRequests = await titresPropsEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
  })

  test('ne trouve pas de propriétés dans les étapes', async () => {
    titrePropTitreEtapeFindMock.mockReturnValue(null)
    const titre: ITitre = {
      id: newTitreId('plop'),
      nom: 'nom titre',
      titreStatutId: TitresStatutIds.Valide,
      typeId: TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
      propsTitreEtapesIds: {},
      demarches: [],
    }
    titresGetMock.mockResolvedValue([titre])

    const titresUpdatedRequests = await titresPropsEtapesIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(0)
  })
})
