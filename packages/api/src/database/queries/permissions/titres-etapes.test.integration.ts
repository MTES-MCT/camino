import { dbManager } from '../../../../tests/db-manager.js'

import Titres from '../../models/titres.js'
import { newDemarcheId, newEtapeId, newTitreId } from '../../models/_format/id-create.js'
import { userSuper } from '../../user-super.js'
import TitresEtapes from '../../models/titres-etapes.js'
import { titresEtapesQueryModify } from './titres-etapes.js'
import TitresDemarches from '../../models/titres-demarches.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { ETAPE_IS_BROUILLON } from 'camino-common/src/etape.js'
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
