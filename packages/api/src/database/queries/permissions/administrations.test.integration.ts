import { dbManager } from '../../../../tests/db-manager.js'
import { IUtilisateur, IAdministration, ITitre, formatUser } from '../../../types.js'

import Titres from '../../models/titres.js'
import Utilisateurs from '../../models/utilisateurs.js'
import AdministrationsActivitesTypesEmails from '../../models/administrations-activites-types-emails.js'
import Administrations from '../../models/administrations.js'
import { AdministrationId, Administrations as CommonAdministrations } from 'camino-common/src/static/administrations.js'
import { administrationsTitresQuery, administrationsQueryModify } from './administrations.js'
import { idGenerate } from '../../models/_format/id-create.js'
import options from '../_options.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'

import { testBlankUser } from 'camino-common/src/tests-utils.js'
console.info = vi.fn()
console.error = vi.fn()

beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('administrationsTitresQuery', () => {
  test.each<[AdministrationId, boolean]>([
    ['ope-brgm-01', false],
    ['ope-onf-973-01', true],
    ['pre-97302-01', true],
    ['ope-ptmg-973-01', true],
  ])("Vérifie l'écriture de la requête sur les titres dont une administration a des droits sur le type", async (administrationId, visible) => {
    await Titres.query().delete()

    const mockTitre = {
      id: 'monTitreId',
      nom: 'monTitreNom',
      titreStatutId: 'ech',
      typeId: 'arm',
    } as ITitre

    await Titres.query().insertGraph(mockTitre)

    const administrationQuery = administrationsTitresQuery(administrationId, 'titres', {
      isGestionnaire: true,
      isAssociee: true,
    })

    const q = Titres.query().where('id', 'monTitreId').andWhereRaw('exists(?)', [administrationQuery])

    const titreRes = await q.first()
    if (visible) {
      expect(titreRes).toMatchObject(mockTitre)
    } else {
      expect(titreRes).toBeUndefined()
    }
  })
})

describe('administrationsQueryModify', () => {
  test('vérifie que le bon nombre de couple types activites + email est retourné par une requête', async () => {
    const mockAdministration = CommonAdministrations['pre-01053-01']

    const email = `${idGenerate()}@bar.com`
    await AdministrationsActivitesTypesEmails.query().delete()
    await AdministrationsActivitesTypesEmails.query().insert({
      administrationId: mockAdministration.id,
      email,
      activiteTypeId: 'grx',
    })

    await AdministrationsActivitesTypesEmails.query().insert({
      administrationId: mockAdministration.id,
      email: 'foo@bar.cc',
      activiteTypeId: 'grx',
    })

    const mockUser: IUtilisateur = {
      ...testBlankUser,
      id: idGenerate(),
      role: 'super',
      email: 'email' + idGenerate(),
      dateCreation: '2022-05-12',
    }

    await Utilisateurs.query().insertGraph(mockUser, options.utilisateurs.update)

    const q = administrationsQueryModify(Administrations.query().where('id', mockAdministration.id), formatUser(mockUser))
    const res = (await q.withGraphFetched({ activitesTypesEmails: {} }).first()) as IAdministration
    expect(res.activitesTypesEmails).toHaveLength(2)
  })
})
