import { dbManager } from '../../../tests/db-manager'
import { idGenerate } from '../models/_format/id-create'
import Titres from '../models/titres'
import TitresDemarches from '../models/titres-demarches'
import TitresEtapes from '../models/titres-etapes'
import { titreDemarcheArchive } from './titres-demarches'
import { toCaminoDate } from 'camino-common/src/date'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { ETAPE_IS_BROUILLON } from 'camino-common/src/etape'
console.info = vi.fn()
console.error = vi.fn()

beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})
describe('teste les requêtes sur les démarches', () => {
  describe('titreDemarcheArchive', () => {
    test('vérifie que la démarche et ses étapes s’archivent correctement', async () => {
      const titre = await Titres.query().insert({
        nom: idGenerate(),
        titreStatutId: 'val',
        typeId: 'arm',
      })

      const demarche = await TitresDemarches.query().insert({
        titreId: titre.id,
        typeId: 'oct',
        statutId: 'eco',
      })
      expect(demarche.archive).toBeFalsy()

      for (let j = 0; j < 3; j++) {
        const etape = await TitresEtapes.query().insert({
          titreDemarcheId: demarche.id,
          typeId: 'mfr',
          statutId: 'fai',
          isBrouillon: ETAPE_IS_BROUILLON,
          date: toCaminoDate('2020-02-02'),
        })
        expect(etape.archive).toBeFalsy()
      }

      await titreDemarcheArchive(demarche.id)

      const archiveDemarche = await TitresDemarches.query().findById(demarche.id).withGraphFetched('etapes')

      expect(archiveDemarche).not.toBe(undefined)
      expect(archiveDemarche?.archive).toBe(true)
      expect(archiveDemarche?.etapes).toHaveLength(3)

      for (const etape of archiveDemarche?.etapes ?? []) {
        expect((etape as TitresEtapes).archive).toBe(true)
      }
    })
  })
})
