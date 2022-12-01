import { dbManager } from '../../../../tests/db-manager.js'

import Titres from '../../models/titres.js'
import { idGenerate, newDemarcheId } from '../../models/_format/id-create.js'
import { userSuper } from '../../user-super.js'
import TitresDemarches from '../../models/titres-demarches.js'
import {
  titreDemarcheSuppressionSelectQuery,
  titresDemarchesQueryModify
} from './titres-demarches.js'
import TitresEtapes from '../../models/titres-etapes.js'
import { Role } from 'camino-common/src/roles.js'
import { Administrations } from 'camino-common/src/static/administrations.js'
import { toCaminoDate } from 'camino-common/src/date.js'
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
  describe('titreDemarcheSuppressionSelectQuery', () => {
    test.each<[Role | undefined, boolean]>([
      ['super', true],
      ['admin', true],
      ['editeur', true],
      ['lecteur', false],
      ['entreprise', false],
      ['defaut', false],
      [undefined, false]
    ])(
      'un utilisateur $user peut supprimer $suppression une démarche qui n’a pas d’étape',
      async (role, suppression) => {
        const titreId = idGenerate()
        await Titres.query().insert([
          {
            id: titreId,
            nom: titreId,
            titreStatutId: 'val',
            domaineId: 'm',
            typeId: 'arm',
            archive: false
          }
        ])

        const titreDemarcheId = newDemarcheId()
        await TitresDemarches.query().insert([
          {
            id: titreDemarcheId,
            typeId: 'oct',
            statutId: 'eco',
            titreId,
            archive: false
          }
        ])
        const q = TitresDemarches.query()
        q.select(
          titreDemarcheSuppressionSelectQuery(
            'titresDemarches',
            role
              ? {
                  id: 'id',
                  dateCreation: '',
                  role,
                  administrationId: Administrations['dea-guyane-01'].id
                }
              : undefined
          ).as('suppression')
        )
        const titreDemarche = await q.findById(titreDemarcheId)

        expect(titreDemarche).toBeTruthy()
        expect(titreDemarche!.suppression).toBe(suppression)
      }
    )

    test.each<[Role | undefined, boolean]>([
      ['super', true],
      ['admin', false],
      ['editeur', false],
      ['lecteur', false],
      ['entreprise', false],
      ['defaut', false],
      [undefined, false]
    ])(
      'un utilisateur $role peut supprimer une démarche qui a au moins une étape',
      async (role, suppression) => {
        const titreId = idGenerate()
        await Titres.query().insert([
          {
            id: titreId,
            nom: titreId,
            titreStatutId: 'val',
            domaineId: 'm',
            typeId: 'arm',
            archive: false
          }
        ])

        const titreDemarcheId = newDemarcheId()
        await TitresDemarches.query().insert([
          {
            id: titreDemarcheId,
            typeId: 'oct',
            statutId: 'eco',
            titreId,
            archive: false
          }
        ])

        await TitresEtapes.query().insert({
          titreDemarcheId,
          date: toCaminoDate('2020-12-23'),
          typeId: 'mfr',
          statutId: 'fai'
        })

        const q = TitresDemarches.query()
        q.select(
          titreDemarcheSuppressionSelectQuery(
            'titresDemarches',
            role
              ? { id: '', dateCreation: '', role, administrationId: undefined }
              : undefined
          ).as('suppression')
        )

        const titreDemarche = await q.findById(titreDemarcheId)

        expect(titreDemarche).toBeTruthy()
        expect(titreDemarche!.suppression).toBe(suppression)
      }
    )
  })
  describe('titresDemarchesArchive', () => {
    test('Vérifie si le statut archivé masque la démarche du titre', async () => {
      const titreId = idGenerate()
      await Titres.query().insert([
        {
          id: titreId,
          nom: titreId,
          titreStatutId: 'val',
          domaineId: 'm',
          typeId: 'arm',
          archive: false
        }
      ])

      const titreDemarcheId = newDemarcheId()
      const archivedTitreDemarcheId = newDemarcheId()
      await TitresDemarches.query().insert([
        {
          id: titreDemarcheId,
          typeId: 'oct',
          statutId: 'eco',
          titreId,
          archive: false
        },
        {
          id: archivedTitreDemarcheId,
          typeId: 'oct',
          statutId: 'eco',
          titreId,
          archive: true
        }
      ])
      const q = TitresDemarches.query().whereIn('titresDemarches.id', [
        titreDemarcheId,
        archivedTitreDemarcheId
      ])
      titresDemarchesQueryModify(q, userSuper)

      const titresDemarches = await q

      expect(titresDemarches).toHaveLength(1)
      expect(titresDemarches[0].id).toBe(titreDemarcheId)
    })
  })
})
