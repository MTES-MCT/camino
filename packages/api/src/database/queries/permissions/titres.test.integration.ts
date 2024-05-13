import { ITitre, ITitreDemarche } from '../../../types.js'

import { dbManager } from '../../../../tests/db-manager.js'

import Titres from '../../models/titres.js'
import { newDemarcheId, newEtapeId, newTitreId } from '../../models/_format/id-create.js'
import { titresArmEnDemandeQuery, titresConfidentielSelect, titresQueryModify, titresVisibleByEntrepriseQuery } from './titres.js'
import { userSuper } from '../../user-super.js'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'

console.info = vi.fn()
console.error = vi.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

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
      const mockTitre: Omit<ITitre, 'id'> = {
        nom: 'titre1',
        typeId: 'arm',
        titreStatutId: 'ind',
        propsTitreEtapesIds: { titulaires: etapeId },
        demarches: [
          {
            id: demarcheId,
            titreId: id,
            typeId: 'oct',
            etapes: [
              {
                id: etapeId,
                titreDemarcheId: demarcheId,
                date: toCaminoDate('2020-01-01'),
                typeId: 'mfr',
                statutId: 'fai',
                titulaireIds: withTitulaire ? [entrepriseId1] : [],
              },
            ],
          } as ITitreDemarche,
        ],
      }

      await Titres.query().insertGraph(mockTitre)

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
      const mockTitre: Omit<ITitre, 'id'> = {
        nom: 'titre1',
        typeId: 'arm',
        titreStatutId: 'ind',
        propsTitreEtapesIds: { amodiataires: etapeId },
        demarches: [
          {
            id: demarcheId,
            titreId: id,
            typeId: 'oct',
            etapes: [
              {
                id: etapeId,
                titreDemarcheId: demarcheId,
                date: toCaminoDate('2020-01-01'),
                typeId: 'mfr',
                statutId: 'fai',
                amodiataireIds: withAmodiataire ? [entrepriseId2] : [],
              },
            ],
          } as ITitreDemarche,
        ],
      }

      await Titres.query().insertGraph(mockTitre)

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
      titreTypeId?: string
      titreStatutId?: string
      demarcheTypeId?: string
      demarcheStatutId?: string
      etapeTypeId?: string
      etapeStatutId?: string
    }) => {
      const mockTitre = {
        nom: 'titre1',
        typeId: titreTypeId,
        titreStatutId,
        demarches: [
          {
            typeId: demarcheTypeId,
            statutId: demarcheStatutId,
            etapes: [
              {
                typeId: etapeTypeId,
                statutId: etapeStatutId,
                date: '2020-01-01',
              },
            ],
          },
        ],
      } as ITitre

      const titre = await Titres.query().insertGraph(mockTitre)

      const res = await Titres.query().where('id', titre.id).modify(titresArmEnDemandeQuery)

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
      ['mdp', 'fai', false],
      ['mdp', 'fav', false],
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
      const mockTitre: ITitre = {
        id,
        nom: 'titre1',
        typeId,
        titreStatutId: statutId,
        publicLecture,
        propsTitreEtapesIds: { titulaires: etapeId },
        demarches: [
          {
            id: demarcheId,
            titreId: id,
            typeId: 'oct',
            statutId: 'ins',
            etapes: [
              {
                id: etapeId,
                titreDemarcheId: demarcheId,
                date: toCaminoDate('2020-01-01'),
                typeId: 'mcr',
                statutId: 'fav',
                titulaireIds: withTitulaire ? [entrepriseId1] : [],
              },
            ],
          } as ITitreDemarche,
        ],
      }

      await Titres.query().insertGraph(mockTitre)

      const q = Titres.query().where('id', id).modify(titresConfidentielSelect, [entrepriseId1])

      const res = await q

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
