import { titreActiviteGet, titreActiviteUpdate, titresActivitesGet } from './titres-activites'
import TitresActivites from '../models/titres-activites'
import { dbManager } from '../../../tests/db-manager'
import { newTitreId, newUtilisateurId } from '../models/_format/id-create'
import Titres from '../models/titres'
import { UserNotNull } from 'camino-common/src/roles'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { getCurrent, toCaminoAnnee } from 'camino-common/src/date'
import { activiteIdValidator, activiteSlugValidator } from 'camino-common/src/activite'
import { userSuper } from '../user-super'
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
    await TitresActivites.query().insert({
      id: titreActiviteId,
      typeId: 'grx',
      titreId,
      date: getCurrent(),
      activiteStatutId: 'dep',
      periodeId: 1,
      sections: [],
      annee: toCaminoAnnee(2000),
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

  test("vérifie que l'update modifie que une activité", async () => {
    await TitresActivites.query().delete()

    const titreId = newTitreId()

    await Titres.query().insert({
      id: titreId,
      nom: titreId,
      titreStatutId: 'val',
      typeId: 'arm',
    })

    const titreActiviteId1 = activiteIdValidator.parse('titreActiviteId1')
    await TitresActivites.query().insert({
      id: titreActiviteId1,
      typeId: 'grx',
      titreId,
      date: getCurrent(),
      activiteStatutId: 'dep',
      periodeId: 1,
      sections: [],
      annee: toCaminoAnnee(2000),
    })
    const titreActiviteId2 = activiteIdValidator.parse('titreActiviteId2')
    const titreActiviteSlug2 = activiteSlugValidator.parse('slug2')
    await TitresActivites.query().insert({
      id: titreActiviteId2,
      slug: titreActiviteSlug2,
      typeId: 'grx',
      titreId,
      date: getCurrent(),
      activiteStatutId: 'dep',
      periodeId: 1,
      sections: [],
      annee: toCaminoAnnee(2000),
    })

    const newSlug = activiteSlugValidator.parse('new-slug')
    await titreActiviteUpdate(titreActiviteId1, { slug: newSlug })
    const newActivite1 = await titreActiviteGet(titreActiviteId1, { fields: { id: {} } }, userSuper)
    expect(newActivite1?.slug).toBe(newSlug)

    const newActivite2 = await titreActiviteGet(titreActiviteId2, { fields: { id: {} } }, userSuper)
    expect(newActivite2?.slug).toBe(titreActiviteSlug2)
  })
})
