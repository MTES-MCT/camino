import { dbManager } from '../../../../tests/db-manager.js'

import Titres from '../../models/titres.js'
import { idGenerate, newDemarcheId } from '../../models/_format/id-create.js'
import { userSuper } from '../../user-super.js'
import TitresDemarches from '../../models/titres-demarches.js'
import { titreDemarcheSuppressionSelectQuery, titresDemarchesQueryModify } from './titres-demarches.js'
import TitresEtapes from '../../models/titres-etapes.js'
import { Administrations } from 'camino-common/src/static/administrations.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import { testBlankUser, TestUser } from 'camino-common/src/tests-utils.js'

console.info = vi.fn()
console.error = vi.fn()

beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('titresDemarchesQueryModify', () => {
  describe('titreDemarcheSuppressionSelectQuery', () => {
    test.each<[TestUser | undefined, boolean]>([
      [{ role: 'super' }, true],
      [
        {
          role: 'admin',
          administrationId: Administrations['dea-guyane-01'].id,
        },
        true,
      ],
      [
        {
          role: 'editeur',
          administrationId: Administrations['dea-guyane-01'].id,
        },
        true,
      ],
      [
        {
          role: 'lecteur',
          administrationId: Administrations['dea-guyane-01'].id,
        },
        false,
      ],
      [{ role: 'entreprise', entreprises: [] }, false],
      [{ role: 'defaut' }, false],
      [undefined, false],
    ])('un utilisateur $user peut supprimer $suppression une démarche qui n’a pas d’étape', async (user, suppression) => {
      const titreId = idGenerate()
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
      await TitresDemarches.query().insert([
        {
          id: titreDemarcheId,
          typeId: 'oct',
          statutId: 'eco',
          titreId,
          archive: false,
        },
      ])
      const q = TitresDemarches.query()
      q.select(titreDemarcheSuppressionSelectQuery('titresDemarches', user ? { ...user, ...testBlankUser } : undefined).as('suppression'))
      const titreDemarche = await q.findById(titreDemarcheId)

      expect(titreDemarche).toBeTruthy()
      expect(titreDemarche!.suppression).toBe(suppression)
    })

    test.each<[TestUser | undefined, boolean]>([
      [{ role: 'super' }, true],
      [
        {
          role: 'admin',
          administrationId: Administrations['dea-guyane-01'].id,
        },
        false,
      ],
      [
        {
          role: 'editeur',
          administrationId: Administrations['dea-guyane-01'].id,
        },
        false,
      ],
      [
        {
          role: 'lecteur',
          administrationId: Administrations['dea-guyane-01'].id,
        },
        false,
      ],
      [{ role: 'entreprise', entreprises: [] }, false],
      [{ role: 'defaut' }, false],
      [undefined, false],
    ])('un utilisateur $role peut supprimer une démarche qui a au moins une étape', async (user, suppression) => {
      const titreId = idGenerate()
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
      await TitresDemarches.query().insert([
        {
          id: titreDemarcheId,
          typeId: 'oct',
          statutId: 'eco',
          titreId,
          archive: false,
        },
      ])

      await TitresEtapes.query().insert({
        titreDemarcheId,
        date: toCaminoDate('2020-12-23'),
        typeId: 'mfr',
        statutId: 'fai',
      })

      const q = TitresDemarches.query()
      q.select(
        titreDemarcheSuppressionSelectQuery(
          'titresDemarches',
          user
            ? {
                ...testBlankUser,
                ...user,
              }
            : undefined
        ).as('suppression')
      )

      const titreDemarche = await q.findById(titreDemarcheId)

      expect(titreDemarche).toBeTruthy()
      expect(titreDemarche!.suppression).toBe(suppression)
    })
  })
  describe('titresDemarchesArchive', () => {
    test('Vérifie si le statut archivé masque la démarche du titre', async () => {
      const titreId = idGenerate()
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
