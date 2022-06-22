import { dbManager } from '../../../../tests/db-manager'
import {
  IUtilisateur,
  IAdministration,
  ITitre,
  formatUser
} from '../../../types'

import AdministrationsTitresTypes from '../../models/administrations-titres-types'
import Titres from '../../models/titres'
import Utilisateurs from '../../models/utilisateurs'
import AdministrationsActivitesTypesEmails from '../../models/administrations-activites-types-emails'
import Administrations from '../../models/administrations'
import { Administrations as CommonAdministrations } from 'camino-common/src/administrations'
import {
  administrationsTitresQuery,
  administrationsQueryModify
} from './administrations'
import { idGenerate } from '../../models/_format/id-create'
import options from '../_options'
import { testBlankUser, TestUser } from '../../../../tests/_utils'

console.info = jest.fn()
console.error = jest.fn()

beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('administrationsTitresQuery', () => {
  test.each`
    gestionnaire | associee | visible
    ${false}     | ${false} | ${false}
    ${true}      | ${false} | ${true}
    ${false}     | ${true}  | ${true}
    ${true}      | ${true}  | ${true}
  `(
    "Vérifie l'écriture de la requête sur les titres dont une administration a des droits sur le type",
    async ({ gestionnaire, associee, visible }) => {
      await Titres.query().delete()
      await AdministrationsTitresTypes.query().delete()

      const mockTitre = {
        id: 'monTitreId',
        nom: 'monTitreNom',
        domaineId: 'm',
        statutId: 'ech',
        typeId: 'arm'
      } as ITitre

      await Titres.query().insertGraph(mockTitre)

      await AdministrationsTitresTypes.query().insertGraph({
        administrationId: 'ope-brgm-01',
        titreTypeId: mockTitre.typeId,
        gestionnaire,
        associee
      })

      const administrationQuery = administrationsTitresQuery(
        'ope-brgm-01',
        'titres',
        {
          isGestionnaire: true,
          isAssociee: true
        }
      ).whereNotNull('a_tt.administrationId')

      const q = Titres.query()
        .where('id', 'monTitreId')
        .andWhereRaw('exists(?)', [administrationQuery])

      const titreRes = await q.first()
      if (visible) {
        expect(titreRes).toMatchObject(mockTitre)
      } else {
        expect(titreRes).toBeUndefined()
      }
    }
  )
})

describe('administrationsQueryModify', () => {
  test.each<[TestUser, boolean]>([
    [{ role: 'super' }, true],
    [{ role: 'admin', administrationId: 'pre-01053-01' }, false],
    [{ role: 'editeur', administrationId: 'pre-01053-01' }, false],
    [{ role: 'lecteur', administrationId: 'pre-01053-01' }, false]
  ])(
    "pour une préfecture, emailsModification est 'true' pour un utilisateur super, 'false' pour tous ses membres",
    async (user, emailsModification) => {
      const mockUser: IUtilisateur = {
        ...testBlankUser,
        ...user,
        id: idGenerate(),
        email: 'email' + idGenerate(),
        motDePasse: 'motdepasse',
        dateCreation: '2022-05-12'
      }

      await Utilisateurs.query().insertGraph(
        mockUser,
        options.utilisateurs.update
      )

      const q = administrationsQueryModify(
        Administrations.query().where('id', 'pre-01053-01'),
        formatUser(mockUser)
      )
      const res = (await q.first()) as IAdministration
      if (!emailsModification) {
        expect(res.emailsModification).toBeFalsy()
      } else {
        expect(res.emailsModification).toBeTruthy()
      }
    }
  )

  test.each<[TestUser, boolean]>([
    [{ role: 'super' }, true],
    [{ role: 'admin', administrationId: 'dre-ile-de-france-01' }, true],
    [{ role: 'editeur', administrationId: 'dre-ile-de-france-01' }, true],
    [{ role: 'lecteur', administrationId: 'dre-ile-de-france-01' }, false],
    [{ role: 'defaut' }, false]
  ])(
    "pour une DREAL/DEAL, emailsModification est 'true' pour ses membres admins et éditeurs, pour les utilisateurs supers, 'false' pour ses autres membres",
    async (user, emailsModification) => {
      const mockUser: IUtilisateur = {
        ...testBlankUser,
        id: idGenerate(),
        ...user,
        email: 'email' + idGenerate(),
        motDePasse: 'motdepasse',
        dateCreation: '2022-05-12'
      }

      await Utilisateurs.query().insertGraph(
        mockUser,
        options.utilisateurs.update
      )

      const q = administrationsQueryModify(
        Administrations.query(),
        formatUser(mockUser)
      )
      const res = (await q.findById('dre-ile-de-france-01')) as IAdministration
      if (!emailsModification) {
        expect(res.emailsModification).toBeFalsy()
      } else {
        expect(res.emailsModification).toBeTruthy()
      }
    }
  )

  test("un admin de région peut voir les mails de la préfecture d'un département associé", async () => {
    const mockDreal = CommonAdministrations['dre-nouvelle-aquitaine-01']
    const prefectureDordogne = 'pre-24322-01'
    const prefectureCorseDuSud = 'pre-2A004-01'

    const mockUser: IUtilisateur = {
      ...testBlankUser,
      id: idGenerate(),
      role: 'admin',
      administrationId: mockDreal.id,
      email: 'email' + idGenerate(),
      motDePasse: 'motdepasse',
      dateCreation: '2022-05-12'
    }

    await Utilisateurs.query().insertGraph(
      mockUser,
      options.utilisateurs.update
    )
    let q = administrationsQueryModify(
      Administrations.query(),
      formatUser(mockUser)
    )

    let res = await q.findById(prefectureDordogne)
    expect(res).not.toBeUndefined()
    expect(res?.emailsModification).toBe(true)

    q = administrationsQueryModify(
      Administrations.query(),
      formatUser(mockUser)
    )
    res = await q.findById(prefectureCorseDuSud)
    expect(res?.emailsModification).toBe(false)
  })

  test.each<[TestUser, boolean]>([
    [{ role: 'admin', administrationId: 'min-dajb-01' }, true],
    [{ role: 'editeur', administrationId: 'min-dajb-01' }, true],
    [{ role: 'lecteur', administrationId: 'min-dajb-01' }, false],
    [{ role: 'defaut' }, false]
  ])(
    "pour un membre $role de ministère, emailsModification est '$emailsModification'",
    async (user, emailsModification) => {
      const mockUser: IUtilisateur = {
        ...testBlankUser,
        id: idGenerate(),
        ...user,
        email: 'email' + idGenerate(),
        motDePasse: 'motdepasse',
        dateCreation: '2022-05-12'
      }

      await Utilisateurs.query().insertGraph(
        mockUser,
        options.utilisateurs.update
      )

      const q = administrationsQueryModify(
        Administrations.query().where('id', 'min-dajb-01'),
        formatUser(mockUser)
      )
      const res = (await q.findById('min-dajb-01')) as IAdministration
      if (!emailsModification) {
        expect(res.emailsModification).toBeFalsy()
      } else {
        expect(res.emailsModification).toBeTruthy()
      }
    }
  )

  test('vérifie que le bon nombre de couple types activites + email est retourné par une requête', async () => {
    const mockAdministration = CommonAdministrations['pre-01053-01']

    const email = `${idGenerate()}@bar.com`
    await AdministrationsActivitesTypesEmails.query().delete()
    await AdministrationsActivitesTypesEmails.query().insert({
      administrationId: mockAdministration.id,
      email,
      activiteTypeId: 'grx'
    })

    await AdministrationsActivitesTypesEmails.query().insert({
      administrationId: mockAdministration.id,
      email: 'foo@bar.cc',
      activiteTypeId: 'grx'
    })

    const mockUser: IUtilisateur = {
      ...testBlankUser,
      id: idGenerate(),
      role: 'super',
      email: 'email' + idGenerate(),
      motDePasse: 'motdepasse',
      dateCreation: '2022-05-12'
    }

    await Utilisateurs.query().insertGraph(
      mockUser,
      options.utilisateurs.update
    )

    const q = administrationsQueryModify(
      Administrations.query().where('id', mockAdministration.id),
      formatUser(mockUser)
    )
    const res = (await q
      .withGraphFetched({ activitesTypesEmails: {} })
      .first()) as IAdministration
    expect(res.activitesTypesEmails).toHaveLength(2)
  })
})
