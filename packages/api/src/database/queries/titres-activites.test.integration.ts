import { titresActivitesGet } from './titres-activites.js'
import TitresActivites from '../models/titres-activites.js'
import { dbManager } from '../../../tests/db-manager.js'
import { newTitreId, newUtilisateurId } from '../models/_format/id-create.js'
import Titres from '../models/titres.js'
import { UserNotNull } from 'camino-common/src/roles.js'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { getCurrent } from 'camino-common/src/date.js'
import { activiteIdValidator } from 'camino-common/src/activite.js'
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

    const titreId = newTitreId()

    await Titres.query().insert({
      id: titreId,
      nom: titreId,
      titreStatutId: 'val',
      typeId: 'arm',
    })

    const titreActiviteId = activiteIdValidator.parse('titreActiviteId')
    await TitresActivites.query().insertGraph({
      id: titreActiviteId,
      typeId: 'grx',
      titreId,
      date: getCurrent(),
      activiteStatutId: 'dep',
      periodeId: 1,
      sections: [],
      annee: 2000,
    })

    const adminDGALN: UserNotNull = {
      id: newUtilisateurId('utilisateurId'),
      role: 'admin',
      nom: 'utilisateurNom',
      prenom: 'utilisateurPrenom',
      email: 'utilisateurEmail',
      administrationId: 'min-mtes-dgaln-01',
    }

    const actual = await titresActivitesGet({}, { fields: { id: {} } }, adminDGALN)

    expect(actual).toHaveLength(1)
    expect(actual[0].id).toEqual(titreActiviteId)
  })
})
