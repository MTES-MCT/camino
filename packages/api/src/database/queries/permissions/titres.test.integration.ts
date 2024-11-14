import { ITitre, ITitreDemarche, ITitreEtape } from '../../../types'

import { dbManager } from '../../../../tests/db-manager'

import Titres from '../../models/titres'
import { newDemarcheId, newEtapeId, newTitreId } from '../../models/_format/id-create'
import { titresArmEnDemandeQuery, titresConfidentielSelect, titresQueryModify, titresVisibleByEntrepriseQuery } from './titres'
import { userSuper } from '../../user-super'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { toCaminoDate } from 'camino-common/src/date'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import TitresDemarches from '../../models/titres-demarches'
import TitresEtapes from '../../models/titres-etapes'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'

console.info = vi.fn()
console.error = vi.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const createTitreWithDemarcheWithEtape = async (titre: ITitre, demarche: Omit<ITitreDemarche, 'titreId'>, etape: Omit<ITitreEtape, 'titreDemarcheId' | 'demarcheIdsConsentement'>): Promise<void> => {
  await Titres.query().insert(titre)
  await TitresDemarches.query().insert({ ...demarche, titreId: titre.id })
  await TitresEtapes.query().insert({ ...etape, titreDemarcheId: demarche.id, etapeFondamentaleId: etape.id })
}

describe('titresQueryModify', () => {
  describe('titresVisibleByEntrepriseQuery', () => {
    test.each([
      [false, false],
      [true, true],
    ])('Vérifie la visibilité d’un titre par un titulaire', async (withTitulaire, visible) => {
      const id = newTitreId()
      const demarcheId = newDemarcheId()
      const etapeId = newEtapeId()

      const entrepriseId1 = entrepriseIdValidator.parse('entrepriseId1')

      await createTitreWithDemarcheWithEtape(
        {
          id,
          nom: 'titre1',
          typeId: 'arm',
          titreStatutId: 'ind',
          propsTitreEtapesIds: { titulaires: etapeId },
        },
        {
          id: demarcheId,
          typeId: 'oct',
        },
        {
          id: etapeId,
          date: toCaminoDate('2020-01-01'),
          typeId: 'mfr',
          statutId: 'fai',
          titulaireIds: withTitulaire ? [entrepriseId1] : [],
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          concurrence: { amIFirst: true },
          hasTitreFrom: true,
        }
      )

      const q = Titres.query()
      titresVisibleByEntrepriseQuery(q, [entrepriseId1])

      const res = await q

      expect(res).toHaveLength(visible ? 1 : 0)
    })

    test.each([
      [false, false],
      [true, true],
    ])('Vérifie la visibilité d’un titre par un amodiataire', async (withAmodiataire, visible) => {
      const id = newTitreId()
      const demarcheId = newDemarcheId()
      const etapeId = newEtapeId()

      const entrepriseId2 = entrepriseIdValidator.parse('entrepriseId2')
      await createTitreWithDemarcheWithEtape(
        {
          id,
          nom: 'titre1',
          typeId: 'arm',
          titreStatutId: 'ind',
          propsTitreEtapesIds: { amodiataires: etapeId },
        },
        {
          id: demarcheId,
          typeId: 'oct',
        },
        {
          id: etapeId,
          date: toCaminoDate('2020-01-01'),
          typeId: 'mfr',
          statutId: 'fai',
          amodiataireIds: withAmodiataire ? [entrepriseId2] : [],
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          concurrence: { amIFirst: true },
          hasTitreFrom: true,
        }
      )

      const q = Titres.query()
      titresVisibleByEntrepriseQuery(q, [entrepriseId2])

      const res = await q

      expect(res).toHaveLength(visible ? 1 : 0)
    })
  })

  describe('titresArmEnDemandeQuery', () => {
    const titresArmEnDemandeQueryTest = async ({
      visible,
      titreTypeId = 'arm',
      titreStatutId = 'dmi',
      demarcheTypeId = 'oct',
      demarcheStatutId = 'ins',
      etapeTypeId = 'mcr',
      etapeStatutId = 'fav',
    }: {
      visible: boolean
      titreTypeId?: TitreTypeId
      titreStatutId?: TitreStatutId
      demarcheTypeId?: DemarcheTypeId
      demarcheStatutId?: DemarcheStatutId
      etapeTypeId?: EtapeTypeId
      etapeStatutId?: EtapeStatutId
    }) => {
      const id = newTitreId()
      const demarcheId = newDemarcheId()
      const etapeId = newEtapeId()
      await createTitreWithDemarcheWithEtape(
        {
          id,
          nom: 'titre1',
          typeId: titreTypeId,
          titreStatutId,
          propsTitreEtapesIds: {},
        },
        {
          id: demarcheId,
          typeId: demarcheTypeId,
          statutId: demarcheStatutId,
        },
        {
          id: etapeId,
          typeId: etapeTypeId,
          statutId: etapeStatutId,
          date: toCaminoDate('2020-01-01'),
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          concurrence: { amIFirst: true },
          hasTitreFrom: true,
        }
      )

      const res = await Titres.query().where('id', id).modify(titresArmEnDemandeQuery)

      expect(res).toHaveLength(visible ? 1 : 0)
    }

    test.each<[TitreTypeId, TitreStatutId, boolean]>([
      ['axm', 'val', false],
      ['axm', 'dmi', false],
      ['arm', 'val', false],
      ['arm', 'dmi', true],
    ])('Vérifie si le titre est une ARM en cours de demande', async (titreTypeId, titreStatutId, visible) => {
      await titresArmEnDemandeQueryTest({
        visible,
        titreTypeId,
        titreStatutId,
      })
    })

    test.each<[DemarcheTypeId, DemarcheStatutId, boolean]>([
      ['pro', 'dep', false],
      ['pro', 'ins', false],
      ['oct', 'dep', false],
      ['oct', 'ins', true],
    ])('Vérifie si la démarche est un octroi en cours d’instruction', async (demarcheTypeId, demarcheStatutId, visible) => {
      await titresArmEnDemandeQueryTest({
        visible,
        demarcheTypeId,
        demarcheStatutId,
      })
    })

    test.each<[EtapeTypeId, EtapeStatutId, boolean]>([
      ['men', 'fai', false],
      ['men', 'fav', false],
      ['mcr', 'fai', false],
      ['mcr', 'fav', true],
    ])('Vérifie si il y a une « Recevabilité de la demande » favorable', async (etapeTypeId, etapeStatutId, visible) => {
      await titresArmEnDemandeQueryTest({
        visible,
        etapeTypeId,
        etapeStatutId,
      })
    })
  })

  describe('titresConfidentielQuery', () => {
    test.each<[boolean | undefined, boolean, TitreTypeId, TitreStatutId, boolean]>([
      [false, false, 'arm', 'dmi', true],
      [undefined, false, 'arm', 'dmi', true],
      [false, true, 'arm', 'dmi', false],
      [false, false, 'axm', 'dmi', false],
      [false, false, 'arm', 'val', false],
      [true, false, 'arm', 'dmi', false],
      [true, true, 'arm', 'dmi', false],
      [true, false, 'arm', 'dmi', false],
    ])('Vérifie si le titre est confidentiel', async (publicLecture, withTitulaire, typeId, statutId, confidentiel) => {
      const etapeId = newEtapeId()
      const demarcheId = newDemarcheId()
      const id = newTitreId()

      const entrepriseId1 = entrepriseIdValidator.parse('entrepriseId1')
      await createTitreWithDemarcheWithEtape(
        {
          id,
          nom: 'titre1',
          typeId,
          titreStatutId: statutId,
          publicLecture,
          propsTitreEtapesIds: { titulaires: etapeId },
        },
        {
          id: demarcheId,
          typeId: 'oct',
          statutId: 'ins',
        },
        {
          id: etapeId,
          date: toCaminoDate('2020-01-01'),
          typeId: 'mcr',
          statutId: 'fav',
          titulaireIds: withTitulaire ? [entrepriseId1] : [],
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          concurrence: { amIFirst: true },
          hasTitreFrom: true,
        }
      )

      const res = await Titres.query().where('id', id).modify(titresConfidentielSelect, [entrepriseId1]) // eslint-disable-line @typescript-eslint/no-misused-promises

      expect(res).toHaveLength(1)
      if (confidentiel) {
        expect(res[0].confidentiel).toBeTruthy()
      } else {
        expect(res[0].confidentiel).toBeFalsy()
      }
    })
  })

  describe('titresArchive', () => {
    test('Vérifie si le statut archivé masque le titre', async () => {
      const archivedTitreId = newTitreId()
      const titreId = newTitreId()
      await Titres.query().insert([
        {
          id: archivedTitreId,
          nom: archivedTitreId,
          titreStatutId: 'val',
          typeId: 'arm',
          archive: true,
        },
        {
          id: titreId,
          nom: titreId,
          titreStatutId: 'val',
          typeId: 'arm',
          archive: false,
        },
      ])

      const q = Titres.query().whereIn('titres.id', [archivedTitreId, titreId])
      titresQueryModify(q, userSuper)

      const titres = await q

      expect(titres).toHaveLength(1)
      expect(titres[0].id).toBe(titreId)
    })
  })
})
