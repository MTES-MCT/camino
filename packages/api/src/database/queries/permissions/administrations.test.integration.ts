import { dbManager } from '../../../../tests/db-manager.js'
import { ITitre } from '../../../types.js'

import Titres from '../../models/titres.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { administrationsTitresQuery } from './administrations.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'

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

    const q = Titres.query()
      .joinRaw(`left join titres_etapes as t_e on t_e.id = "titres"."props_titre_etapes_ids" ->> 'points' and t_e.administrations_locales @> '"${administrationId}"'::jsonb`)
      .modify(administrationsTitresQuery, administrationId, 'titres', 'and', 't_e')
      .where('titres.id', 'monTitreId')

    const titreRes = await q.first()
    if (visible) {
      expect(titreRes).toMatchObject(mockTitre)
    } else {
      expect(titreRes).toBe(undefined)
    }
  })
})
