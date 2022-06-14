import { dbManager } from '../../../../tests/db-manager'
import { IUtilisateur, IAdministration } from '../../../types'

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
      }

      await Titres.query().insertGraph(mockTitre)

      await AdministrationsTitresTypes.query().insertGraph({
        administrationId: 'ope-brgm-01',
        titreTypeId: mockTitre.typeId,
        gestionnaire,
        associee
      })

      const administrationQuery = administrationsTitresQuery(
        ['ope-brgm-01'],
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
  test.each`
    role         | emailsModification
    ${'super'}   | ${true}
    ${'admin'}   | ${false}
    ${'editeur'} | ${false}
    ${'lecteur'} | ${false}
  `(
    "pour une préfecture, emailsModification est 'true' pour un utilisateur super, 'false' pour tous ses membres",
    async ({ role, emailsModification }) => {
      const mockAdministration = CommonAdministrations['pre-01053-01']

      const mockUser: IUtilisateur = {
        id: idGenerate(),
        role,
        administrations: [mockAdministration],
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
        mockUser
      )
      const res = (await q.first()) as IAdministration
      if (!emailsModification) {
        expect(res.emailsModification).toBeFalsy()
      } else {
        expect(res.emailsModification).toBeTruthy()
      }
    }
  )

  test.each`
    role         | emailsModification
    ${'super'}   | ${true}
    ${'admin'}   | ${true}
    ${'editeur'} | ${true}
    ${'lecteur'} | ${false}
    ${'defaut'}  | ${false}
  `(
    "pour une DREAL/DEAL, emailsModification est 'true' pour ses membres admins et éditeurs, pour les utilisateurs supers, 'false' pour ses autres membres",
    async ({ role, emailsModification }) => {
      const mockDreal = CommonAdministrations['dre-ile-de-france-01']

      const mockUser: IUtilisateur = {
        id: idGenerate(),
        role,
        administrations: [mockDreal],
        email: 'email' + idGenerate(),
        motDePasse: 'motdepasse',
        dateCreation: '2022-05-12'
      }

      await Utilisateurs.query().insertGraph(
        mockUser,
        options.utilisateurs.update
      )

      const q = administrationsQueryModify(Administrations.query(), mockUser)
      const res = (await q.findById(mockDreal.id)) as IAdministration
      if (!emailsModification) {
        expect(res.emailsModification).toBeFalsy()
      } else {
        expect(res.emailsModification).toBeTruthy()
      }
    }
  )

  test("un admin de région peut voir les mails de la préfecture d'un départument associé", async () => {
    const mockDreal = CommonAdministrations['dre-nouvelle-aquitaine-01']
    const prefectureDordogne = 'pre-24322-01'
    const prefectureCorseDuSud = 'pre-2A004-01'

    const mockUser: IUtilisateur = {
      id: idGenerate(),
      role: 'admin',
      administrations: [mockDreal],
      email: 'email' + idGenerate(),
      motDePasse: 'motdepasse',
      dateCreation: '2022-05-12'
    }

    await Utilisateurs.query().insertGraph(
      mockUser,
      options.utilisateurs.update
    )
    let q = administrationsQueryModify(Administrations.query(), mockUser)

    let res = await q.findById(prefectureDordogne)
    expect(res).not.toBeUndefined()
    expect(res?.emailsModification).toBe(true)

    q = administrationsQueryModify(Administrations.query(), mockUser)
    res = await q.findById(prefectureCorseDuSud)
    expect(res?.emailsModification).toBe(null)
  })

  test.each`
    role         | emailsModification
    ${'admin'}   | ${true}
    ${'editeur'} | ${true}
    ${'lecteur'} | ${false}
    ${'defaut'}  | ${false}
  `(
    "pour un membre de ministère, emailsModification est 'true' pour ses membres admins et éditeurs, 'false' pour ses lecteurs",
    async ({ role, emailsModification }) => {
      const mockMin = CommonAdministrations['min-dajb-01']

      const mockUser: IUtilisateur = {
        id: idGenerate(),
        role,
        administrations: [mockMin],
        email: 'email' + idGenerate(),
        motDePasse: 'motdepasse',
        dateCreation: '2022-05-12'
      }

      await Utilisateurs.query().insertGraph(
        mockUser,
        options.utilisateurs.update
      )

      const q = administrationsQueryModify(
        Administrations.query().where('id', mockMin.id),
        mockUser
      )
      const res = (await q.findById(mockMin.id)) as IAdministration
      if (!emailsModification) {
        expect(res.emailsModification).toBeFalsy()
      } else {
        expect(res.emailsModification).toBeTruthy()
      }
    }
  )

  test.each`
    role         | emailsLecture
    ${'super'}   | ${true}
    ${'admin'}   | ${true}
    ${'editeur'} | ${true}
    ${'lecteur'} | ${true}
    ${'defaut'}  | ${false}
  `(
    "pour une préfecture, emailsLecture est 'true' pour un utilisateur super et pour tous ses membres",
    async ({ role, emailsLecture }) => {
      const mockAdministration = CommonAdministrations['pre-01053-01']

      const email = `${idGenerate()}@bar.com`
      await AdministrationsActivitesTypesEmails.query().delete()
      await AdministrationsActivitesTypesEmails.query().insert({
        administrationId: mockAdministration.id,
        email,
        activiteTypeId: 'grx'
      })

      const mockUser: IUtilisateur = {
        id: idGenerate(),
        role,
        administrations: [mockAdministration],
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
        mockUser
      )
      const res = (await q
        .withGraphFetched({ activitesTypesEmails: {} })
        .first()) as IAdministration
      if (!emailsLecture) {
        expect(res.emailsLecture).toBeFalsy()
        expect(res.activitesTypesEmails).toHaveLength(0)
      } else {
        expect(res.emailsLecture).toBeTruthy()
        expect(res.activitesTypesEmails?.length).toBeTruthy()
        expect(res.activitesTypesEmails![0].email).toBe(email)
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
      id: idGenerate(),
      role: 'super',
      administrations: [mockAdministration],
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
      mockUser
    )
    const res = (await q
      .withGraphFetched({ activitesTypesEmails: {} })
      .first()) as IAdministration
    expect(res.activitesTypesEmails).toHaveLength(2)
  })
})
