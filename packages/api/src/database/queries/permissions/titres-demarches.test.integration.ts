import { dbManager } from '../../../../tests/db-manager'

import Titres from '../../models/titres'
import { idGenerate } from '../../models/_format/id-create'
import { userSuper } from '../../user-super'
import TitresDemarches from '../../models/titres-demarches'
import {
  titreDemarcheSuppressionSelectQuery,
  titresDemarchesQueryModify
} from './titres-demarches'
import TitresEtapes from '../../models/titres-etapes'
import { Role } from 'camino-common/src/roles'

console.info = jest.fn()
console.error = jest.fn()

beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('titresDemarchesQueryModify', () => {
  describe('titreDemarcheSuppressionSelectQuery', () => {
    test.each`
      role            | suppression
      ${'super'}      | ${true}
      ${'admin'}      | ${true}
      ${'editeur'}    | ${true}
      ${'lecteur'}    | ${false}
      ${'entreprise'} | ${false}
      ${'default'}    | ${false}
      ${undefined}    | ${false}
    `(
      'un utilisateur $user peut supprimer $suppression une démarche qui n’a pas d’étape',
      async ({
        role,
        suppression
      }: {
        role: Role | undefined
        suppression: boolean
      }) => {
        const titreId = idGenerate()
        await Titres.query().insert([
          {
            id: titreId,
            nom: titreId,
            statutId: 'val',
            domaineId: 'm',
            typeId: 'arm',
            archive: false
          }
        ])

        const titreDemarcheId = idGenerate()
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
            role ? { id: 'id', dateCreation: '', role } : undefined
          ).as('suppression')
        )
        const titreDemarche = await q.findById(titreDemarcheId)

        expect(titreDemarche).toBeTruthy()
        expect(titreDemarche!.suppression).toBe(suppression)
      }
    )

    test.each`
      role            | suppression
      ${'super'}      | ${true}
      ${'admin'}      | ${false}
      ${'editeur'}    | ${false}
      ${'lecteur'}    | ${false}
      ${'entreprise'} | ${false}
      ${'default'}    | ${false}
      ${undefined}    | ${false}
    `(
      'un utilisateur $role peut supprimer une démarche qui a au moins une étape',
      async ({
        role,
        suppression
      }: {
        role: Role | undefined
        suppression: boolean
      }) => {
        const titreId = idGenerate()
        await Titres.query().insert([
          {
            id: titreId,
            nom: titreId,
            statutId: 'val',
            domaineId: 'm',
            typeId: 'arm',
            archive: false
          }
        ])

        const titreDemarcheId = idGenerate()
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
          date: '2020-12-23',
          typeId: 'mfr',
          statutId: 'fai'
        })

        const q = TitresDemarches.query()
        q.select(
          titreDemarcheSuppressionSelectQuery(
            'titresDemarches',
            role ? { id: '', dateCreation: '', role } : undefined
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
          statutId: 'val',
          domaineId: 'm',
          typeId: 'arm',
          archive: false
        }
      ])

      const titreDemarcheId = idGenerate()
      const archivedTitreDemarcheId = idGenerate()
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
