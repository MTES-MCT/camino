import { titresActivitesGet } from './titres-activites.js'
import TitresActivites from '../models/titres-activites.js'
import { dbManager } from '../../../tests/db-manager.js'
import { IUtilisateur } from '../../types.js'
import { idGenerate } from '../models/_format/id-create.js'
import Titres from '../models/titres.js'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { getCurrent } from 'camino-common/src/date.js'
console.info = vi.fn()
console.error = vi.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})
describe('teste les requêtes sur les activités', () => {
  test('vérifie que le filtrage fonctionne pour les administrations', async () => {
    await TitresActivites.query().delete()

    const titreId = idGenerate()

    await Titres.query().insert({
      id: titreId,
      nom: idGenerate(),
      titreStatutId: 'val',
      domaineId: 'm',
      typeId: 'arm'
    })

    const titreActiviteId = 'titreActiviteId'
    await TitresActivites.query().insertGraph({
      id: titreActiviteId,
      typeId: 'grx',
      titreId,
      date: getCurrent(),
      activiteStatutId: 'dep',
      periodeId: 1,
      annee: 2000
    })

    const adminDGALN: IUtilisateur = {
      id: 'utilisateurId',
      role: 'admin',
      nom: 'utilisateurNom',
      email: 'utilisateurEmail',
      motDePasse: 'utilisateurMotdepasse',
      administrationId: 'min-mtes-dgaln-01',
      dateCreation: '2022-05-12'
    }

    const actual = await titresActivitesGet(
      {},
      { fields: { id: {} } },
      adminDGALN
    )

    expect(actual).toHaveLength(1)
    expect(actual[0].id).toEqual(titreActiviteId)
  })
})
