import { dbManager } from '../../../../tests/db-manager.js'

import Titres from '../../models/titres.js'
import { newDemarcheId, newTitreId } from '../../models/_format/id-create.js'
import { userSuper } from '../../user-super.js'
import TitresDemarches from '../../models/titres-demarches.js'
import { titresDemarchesQueryModify } from './titres-demarches.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'

console.info = vi.fn()
console.error = vi.fn()

beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('titresDemarchesQueryModify', () => {
  describe('titresDemarchesArchive', () => {
    test('Vérifie si le statut archivé masque la démarche du titre', async () => {
      const titreId = newTitreId()
      await Titres.query().insert([
        {
          id: titreId,
          nom: titreId,
          titreStatutId: 'val',
          typeId: 'arm',
          archive: false,
        },
      ])

      const titreDemarcheId = newDemarcheId()
      const archivedTitreDemarcheId = newDemarcheId()
      await TitresDemarches.query().insert([
        {
          id: titreDemarcheId,
          typeId: 'oct',
          statutId: 'eco',
          titreId,
          archive: false,
        },
        {
          id: archivedTitreDemarcheId,
          typeId: 'oct',
          statutId: 'eco',
          titreId,
          archive: true,
        },
      ])
      const q = TitresDemarches.query().whereIn('titresDemarches.id', [titreDemarcheId, archivedTitreDemarcheId])
      titresDemarchesQueryModify(q, userSuper)

      const titresDemarches = await q

      expect(titresDemarches).toHaveLength(1)
      expect(titresDemarches[0].id).toBe(titreDemarcheId)
    })
  })
})
