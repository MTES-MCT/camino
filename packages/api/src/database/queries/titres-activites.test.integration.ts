import { titresActivitesGet } from './titres-activites'
import TitresActivites from '../models/titres-activites'
import { dbManager } from '../../../tests/db-manager'
import { newTitreId, newUtilisateurId } from '../models/_format/id-create'
import Titres from '../models/titres'
import { UserNotNull } from 'camino-common/src/roles'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { getCurrent } from 'camino-common/src/date'
import { activiteIdValidator } from 'camino-common/src/activite'
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
      telephone_fixe: null,
      telephone_mobile: null,
    }

    const actual = await titresActivitesGet({}, { fields: { id: {} } }, adminDGALN)

    expect(actual).toHaveLength(1)
    expect(actual[0].id).toEqual(titreActiviteId)
  })
})
