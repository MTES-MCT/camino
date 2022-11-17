import { dbManager } from '../../../tests/db-manager'
import { idGenerate } from '../models/_format/id-create'
import Titres from '../models/titres'
import TitresDemarches from '../models/titres-demarches'
import TitresEtapes from '../models/titres-etapes'
import { titreArchive } from './titres'
import { toCaminoDate } from 'camino-common/src/date'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'

console.info = vi.fn()
console.error = vi.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})
describe('teste les requêtes sur les titres', () => {
  describe('titreArchive', () => {
    test('vérifie que le titre, ses démarches et ses étapes s’archivent correctement', async () => {
      const titre = await Titres.query().insert({
        nom: idGenerate(),
        titreStatutId: 'val',
        domaineId: 'm',
        typeId: 'arm'
      })
      expect(titre.archive).toBeFalsy()

      for (let i = 0; i < 3; i++) {
        const demarche = await TitresDemarches.query().insert({
          titreId: titre.id,
          typeId: 'oct',
          statutId: 'eco'
        })
        expect(demarche.archive).toBeFalsy()

        for (let j = 0; j < 3; j++) {
          const etape = await TitresEtapes.query().insert({
            titreDemarcheId: demarche.id,
            typeId: 'mfr',
            statutId: 'aco',
            date: toCaminoDate('2020-02-02')
          })
          expect(etape.archive).toBeFalsy()
        }
      }

      await titreArchive(titre.id)

      const archiveTitre = await Titres.query().findById(titre.id)

      expect(archiveTitre).not.toBeUndefined()
      expect(archiveTitre?.archive).toBe(true)

      const archiveDemarches = await TitresDemarches.query().where(
        'titreId',
        archiveTitre!.id
      )
      expect(archiveDemarches).toHaveLength(3)

      for (const demarche of archiveDemarches) {
        expect(demarche.archive).toBe(true)

        const archiveEtapes = await TitresEtapes.query().where(
          'titreDemarcheId',
          demarche.id
        )
        expect(archiveEtapes).toHaveLength(3)

        for (const etape of archiveDemarches) {
          expect(etape.archive).toBe(true)
        }
      }
    })
  })
})
