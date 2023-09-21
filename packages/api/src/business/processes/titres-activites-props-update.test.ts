import { titresActivitesPropsUpdate } from './titres-activites-props-update.js'
import { titresActivitesUpsert } from '../../database/queries/titres-activites.js'
import { titresGet } from '../../database/queries/titres.js'
import { titreValideCheck } from '../utils/titre-valide-check.js'
import { vi, describe, expect, test, afterEach } from 'vitest'
import { titreIdValidator } from 'camino-common/src/titres.js'
import { ITitre, ITitreDemarche } from '../../types.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { activiteIdValidator } from 'camino-common/src/activite.js'

vi.mock('../../database/queries/titres-activites', () => ({
  titresActivitesUpsert: vi.fn(),
}))

vi.mock('../../database/queries/titres', () => ({
  titresGet: vi.fn(),
}))

vi.mock('../utils/titre-valide-check', () => ({
  titreValideCheck: vi.fn(),
}))

const titresActivitesUpsertMock = vi.mocked(titresActivitesUpsert, true)
const titresGetMock = vi.mocked(titresGet, true)
const titreValideCheckMock = vi.mocked(titreValideCheck, true)

console.info = vi.fn()
afterEach(() => {
  vi.resetAllMocks()
})
describe("propriété des activités d'un titre", () => {
  test("met à jour la propriété suppression d'une activité", async () => {
    const titreId = titreIdValidator.parse('titre-id')
    const titresActivitesToUpdate = [
      {
        id: titreId,
        nom: 'nom du titre',
        titreStatutId: 'val',
        propsTitreEtapesIds: {},
        typeId: 'axm',
        demarches: [{} as unknown as ITitreDemarche],
        activites: [
          {
            id: activiteIdValidator.parse('titre-activite-id-2019-03'),
            titreId,
            sections: [],
            activiteStatutId: 'abs',
            date: toCaminoDate('2019-10-01'),
            annee: 2019,
            periodeId: 3,
            typeId: 'grp',
            suppression: true,
          },
          {
            id: activiteIdValidator.parse('titre-activite-id-2019-04'),
            titreId,
            sections: [],
            activiteStatutId: 'abs',
            date: toCaminoDate('2020-01-01'),
            annee: 2019,
            periodeId: 4,
            typeId: 'grp',
          },
          {
            id: activiteIdValidator.parse('titre-activite-id-2020-01'),
            titreId,
            sections: [],
            activiteStatutId: 'abs',
            date: toCaminoDate('2020-04-01'),
            annee: 2020,
            periodeId: 1,
            typeId: 'grp',
            suppression: true,
          },
          {
            id: activiteIdValidator.parse('titre-activite-id-2020-02'),
            titreId,
            sections: [],
            activiteStatutId: 'abs',
            date: toCaminoDate('2020-07-01'),
            annee: 2020,
            periodeId: 2,
            typeId: 'grp',
          },
        ],
      },
    ] as ITitre[]

    titresGetMock.mockResolvedValue(titresActivitesToUpdate)
    titreValideCheckMock.mockReturnValueOnce(false)
    titreValideCheckMock.mockReturnValueOnce(false)
    titreValideCheckMock.mockReturnValueOnce(true)
    titreValideCheckMock.mockReturnValueOnce(true)
    const titresActivitesUpdated = await titresActivitesPropsUpdate()

    expect(titresActivitesUpdated).toEqual(['titre-activite-id-2019-04', 'titre-activite-id-2020-01'])
    expect(titresActivitesUpsertMock).toHaveBeenCalled()
  })
  test("ne met pas à jour la propriété suppression d'une activité", async () => {
    const titresActivitesNotToUpdate: ITitre[] = [
      {
        id: titreIdValidator.parse('titre-id'),
        typeId: 'axm',
        nom: 'nom du titre',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
      },
      {
        id: titreIdValidator.parse('titre-id'),
        typeId: 'axm',
        nom: 'nom du titre',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
        activites: [],
      },
      {
        id: titreIdValidator.parse('titre-id'),
        typeId: 'axm',
        nom: 'nom du titre',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
        activites: [
          {
            id: activiteIdValidator.parse('titre-activite-id-2019-03'),
            date: toCaminoDate('2019-10-01'),
            titreId: titreIdValidator.parse('titre-id'),
            annee: 2019,
            periodeId: 3,
            typeId: 'grp',
            activiteStatutId: 'abs',
            sections: [],
            suppression: true,
          },
        ],
      },
      {
        id: titreIdValidator.parse('titre-id'),
        typeId: 'axm',
        nom: 'nom du titre',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
        demarches: [],
        activites: [
          {
            id: activiteIdValidator.parse('titre-activite-id-2019-03'),
            titreId: titreIdValidator.parse('titre-id'),
            date: toCaminoDate('2019-10-01'),
            annee: 2019,
            activiteStatutId: 'abs',
            periodeId: 3,
            typeId: 'grp',
            sections: [],
            suppression: true,
          },
        ],
      },
    ]
    titresGetMock.mockResolvedValue(titresActivitesNotToUpdate)
    const titresActivitesUpdated = await titresActivitesPropsUpdate()

    expect(titresActivitesUpdated).toEqual([])
    expect(titresActivitesUpsertMock).not.toHaveBeenCalled()
  })
})
