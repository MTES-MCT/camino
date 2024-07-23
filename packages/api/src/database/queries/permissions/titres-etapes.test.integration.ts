import { dbManager } from '../../../../tests/db-manager'

import Titres from '../../models/titres'
import { newDemarcheId, newEtapeId, newTitreId } from '../../models/_format/id-create'
import { userSuper } from '../../user-super'
import TitresEtapes from '../../models/titres-etapes'
import { titresEtapesQueryModify } from './titres-etapes'
import TitresDemarches from '../../models/titres-demarches'
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

describe('titresEtapesQueryModify', () => {
  describe('titresEtapesArchive', () => {
    test("Vérifie si le statut archivé masque l'étape de la démarche", async () => {
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
      await TitresDemarches.query().insert({
        id: titreDemarcheId,
        typeId: 'oct',
        statutId: 'eco',
        titreId,
        archive: false,
      })
      const titreEtapeId = newEtapeId()
      const archivedTitreEtapeId = newEtapeId()
      await TitresEtapes.query().insert([
        {
          id: titreEtapeId,
          date: toCaminoDate('2022-03-09'),
          typeId: 'mfr',
          statutId: 'fai',
          isBrouillon: ETAPE_IS_BROUILLON,
          titreDemarcheId,
          archive: false,
        },
        {
          id: archivedTitreEtapeId,
          date: toCaminoDate('2022-03-09'),
          typeId: 'mfr',
          statutId: 'fai',
          isBrouillon: ETAPE_IS_BROUILLON,
          titreDemarcheId,
          archive: true,
        },
      ])
      const q = TitresEtapes.query()
      titresEtapesQueryModify(q, userSuper)

      const titresEtapes = await q

      expect(titresEtapes).toHaveLength(1)
      expect(titresEtapes[0].id).toBe(titreEtapeId)
    })
  })
})
