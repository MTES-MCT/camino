import { IEntreprise, ITitre, ITitreDemarche } from '../../../types'

import { dbManager } from '../../../../tests/db-manager'

import Titres from '../../models/titres'
import { idGenerate } from '../../models/_format/id-create'
import {
  titresArmEnDemandeQuery,
  titresConfidentielSelect,
  titresModificationSelectQuery,
  titresQueryModify,
  titresTravauxCreationQuery,
  titresVisibleByEntrepriseQuery
} from './titres'
import AdministrationsTitresTypes from '../../models/administrations-titres-types'
import AdministrationsTitresTypesTitresStatuts from '../../models/administrations-titres-types-titres-statuts'
import { userSuper } from '../../user-super'
import {
  ADMINISTRATION_IDS,
  AdministrationId
} from 'camino-common/src/administrations'
import { Role } from 'camino-common/src/roles'

console.info = jest.fn()
console.error = jest.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('titresQueryModify', () => {
  describe('titresVisibleByEntrepriseQuery', () => {
    test.each`
      entreprisesLecture | withTitulaire | visible
      ${false}           | ${false}      | ${false}
      ${false}           | ${true}       | ${false}
      ${true}            | ${false}      | ${false}
      ${true}            | ${true}       | ${true}
    `(
      'Vérifie la visibilité d’un titre par une entreprise',
      async ({ entreprisesLecture, withTitulaire, visible }) => {
        const mockEntreprise1 = {
          id: idGenerate(),
          nom: 'monEntrepriseNom'
        } as IEntreprise

        const etapeId = idGenerate()

        const mockTitre: Omit<ITitre, 'id'> = {
          nom: 'titre1',
          domaineId: 'm',
          typeId: 'arm',
          entreprisesLecture,
          propsTitreEtapesIds: { titulaires: etapeId },
          demarches: [
            {
              typeId: 'oct',
              etapes: [
                {
                  id: etapeId,
                  date: '2020-01-01',
                  typeId: 'mfr',
                  statutId: 'fai',
                  titulaires: withTitulaire ? [mockEntreprise1] : []
                }
              ]
            } as ITitreDemarche
          ]
        }

        await Titres.query().insertGraph(mockTitre)

        const q = Titres.query()
        titresVisibleByEntrepriseQuery(q, [mockEntreprise1.id])

        const res = await q

        expect(res).toHaveLength(visible ? 1 : 0)
      }
    )
  })

  describe('titresArmEnDemandeQuery', () => {
    const titresArmEnDemandeQueryTest = async ({
      visible,
      titreTypeId = 'arm',
      titreStatutId = 'dmi',
      demarcheTypeId = 'oct',
      demarcheStatutId = 'ins',
      etapeTypeId = 'mcr',
      etapeStatutId = 'fav'
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
        domaineId: 'm',
        typeId: titreTypeId,
        statutId: titreStatutId,
        demarches: [
          {
            typeId: demarcheTypeId,
            statutId: demarcheStatutId,
            etapes: [
              {
                typeId: etapeTypeId,
                statutId: etapeStatutId,
                date: '2020-01-01'
              }
            ]
          }
        ]
      } as ITitre

      const titre = await Titres.query().insertGraph(mockTitre)

      const res = await Titres.query()
        .where('id', titre.id)
        .modify(titresArmEnDemandeQuery)

      expect(res).toHaveLength(visible ? 1 : 0)
    }

    test.each`
      titreTypeId | titreStatutId | visible
      ${'axm'}    | ${'val'}      | ${false}
      ${'axm'}    | ${'dmi'}      | ${false}
      ${'arm'}    | ${'val'}      | ${false}
      ${'arm'}    | ${'dmi'}      | ${true}
    `(
      'Vérifie si le titre est une ARM en cours de demande',
      async ({ titreTypeId, titreStatutId, visible }) => {
        await titresArmEnDemandeQueryTest({
          visible,
          titreTypeId,
          titreStatutId
        })
      }
    )

    test.each`
      demarcheTypeId | demarcheStatutId | visible
      ${'pro'}       | ${'dep'}         | ${false}
      ${'pro'}       | ${'ins'}         | ${false}
      ${'oct'}       | ${'dep'}         | ${false}
      ${'oct'}       | ${'ins'}         | ${true}
    `(
      'Vérifie si la démarche est un octroi en cours d’instruction',
      async ({ demarcheTypeId, demarcheStatutId, visible }) => {
        await titresArmEnDemandeQueryTest({
          visible,
          demarcheTypeId,
          demarcheStatutId
        })
      }
    )

    test.each`
      etapeTypeId | etapeStatutId | visible
      ${'mdp'}    | ${'fai'}      | ${false}
      ${'mdp'}    | ${'fav'}      | ${false}
      ${'mcr'}    | ${'fai'}      | ${false}
      ${'mcr'}    | ${'fav'}      | ${true}
    `(
      'Vérifie si il y a une « Recevabilité de la demande » favorable',
      async ({ etapeTypeId, etapeStatutId, visible }) => {
        await titresArmEnDemandeQueryTest({
          visible,
          etapeTypeId,
          etapeStatutId
        })
      }
    )
  })

  describe('titresConfidentielQuery', () => {
    test.each`
      publicLecture | entreprisesLecture | withTitulaire | typeId   | statutId | confidentiel
      ${false}      | ${false}           | ${false}      | ${'arm'} | ${'dmi'} | ${true}
      ${false}      | ${false}           | ${true}       | ${'arm'} | ${'dmi'} | ${true}
      ${undefined}  | ${true}            | ${false}      | ${'arm'} | ${'dmi'} | ${true}
      ${false}      | ${true}            | ${true}       | ${'arm'} | ${'dmi'} | ${false}
      ${false}      | ${false}           | ${false}      | ${'axm'} | ${'dmi'} | ${false}
      ${false}      | ${false}           | ${false}      | ${'arm'} | ${'val'} | ${false}
      ${true}       | ${false}           | ${false}      | ${'arm'} | ${'dmi'} | ${false}
      ${true}       | ${false}           | ${true}       | ${'arm'} | ${'dmi'} | ${false}
      ${true}       | ${true}            | ${false}      | ${'arm'} | ${'dmi'} | ${false}
    `(
      'Vérifie si le titre est confidentiel',
      async ({
        publicLecture,
        entreprisesLecture,
        withTitulaire,
        typeId,
        statutId,
        confidentiel
      }) => {
        const mockEntreprise1 = {
          id: idGenerate(),
          nom: 'monEntrepriseNom'
        } as IEntreprise

        const etapeId = idGenerate()

        const id = idGenerate()

        const mockTitre: ITitre = {
          id,
          nom: 'titre1',
          domaineId: 'm',
          typeId,
          statutId,
          publicLecture,
          entreprisesLecture,
          propsTitreEtapesIds: { titulaires: etapeId },
          demarches: [
            {
              typeId: 'oct',
              statutId: 'ins',
              etapes: [
                {
                  id: etapeId,
                  date: '2020-01-01',
                  typeId: 'mcr',
                  statutId: 'fav',
                  titulaires: withTitulaire ? [mockEntreprise1] : []
                }
              ]
            } as ITitreDemarche
          ]
        }

        await Titres.query().insertGraph(mockTitre)

        const q = Titres.query()
          .where('id', id)
          .modify(titresConfidentielSelect, [mockEntreprise1.id])

        const res = await q

        expect(res).toHaveLength(1)
        if (confidentiel) {
          expect(res[0].confidentiel).toBeTruthy()
        } else {
          expect(res[0].confidentiel).toBeFalsy()
        }
      }
    )
  })

  describe('titresTravauxCreationQuery', () => {
    test.each`
      administrationId                           | gestionnaire | travauxCreation
      ${'dre-ile-de-france-01'}                  | ${false}     | ${false}
      ${'dea-guadeloupe-01'}                     | ${false}     | ${false}
      ${'min-mtes-dgec-01'}                      | ${false}     | ${false}
      ${'pre-42218-01'}                          | ${false}     | ${false}
      ${'ope-ptmg-973-01'}                       | ${false}     | ${false}
      ${'dre-ile-de-france-01'}                  | ${true}      | ${true}
      ${ADMINISTRATION_IDS['DEAL - GUADELOUPE']} | ${true}      | ${true}
      ${'min-mtes-dgec-01'}                      | ${true}      | ${false}
      ${'pre-42218-01'}                          | ${true}      | ${false}
      ${'ope-ptmg-973-01'}                       | ${true}      | ${false}
    `(
      'Vérifie si le $administrationId, gestionnaire $gestionnaire peut créer des travaux ($travauxCreation)',
      async ({
        administrationId,
        gestionnaire,
        travauxCreation
      }: {
        administrationId: AdministrationId
        gestionnaire: boolean
        travauxCreation: boolean
      }) => {
        const titreId = idGenerate()

        await Titres.query().insert({
          id: titreId,
          nom: idGenerate(),
          statutId: 'val',
          domaineId: 'm',
          typeId: 'arm'
        })

        await AdministrationsTitresTypes.query().delete()
        if (gestionnaire) {
          await AdministrationsTitresTypes.query().insert({
            administrationId,
            titreTypeId: 'arm',
            gestionnaire: true
          })
        }

        await AdministrationsTitresTypesTitresStatuts.query().delete()

        const q = Titres.query()
        titresTravauxCreationQuery(q, {
          role: 'admin',
          administrationId
        })

        const titre = (await q.first()) as ITitre

        expect(titre.travauxCreation ?? false).toEqual(travauxCreation)
      }
    )
    test.each`
      role            | travauxCreation
      ${'super'}      | ${true}
      ${'entreprise'} | ${false}
      ${'default'}    | ${false}
    `(
      'Vérifie si un profil $role peut créer des travaux',
      async ({ role, travauxCreation }) => {
        const titreId = idGenerate()

        await Titres.query().insert({
          id: titreId,
          nom: idGenerate(),
          statutId: 'val',
          domaineId: 'm',
          typeId: 'arm'
        })

        const q = Titres.query()
        titresTravauxCreationQuery(q, {
          role,
          administrationId: undefined
        })

        const titre = (await q.first()) as ITitre

        expect(titre.travauxCreation ?? false).toEqual(travauxCreation)
      }
    )
  })

  describe('titresModificationSelectQuery', () => {
    test.each`
      role         | modification
      ${'admin'}   | ${true}
      ${'editeur'} | ${true}
      ${'lecteur'} | ${false}
    `(
      'un utilisateur $role d’une administration gestionnaire peut modifier un titre',
      async ({ role, modification }: { role: Role; modification: boolean }) => {
        await Titres.query().insert({
          nom: idGenerate(),
          statutId: 'val',
          domaineId: 'm',
          typeId: 'arm'
        })

        await AdministrationsTitresTypes.query().delete()
        const administrationId = 'ope-ptmg-973-01'
        await AdministrationsTitresTypes.query().insert({
          administrationId,
          titreTypeId: 'arm',
          gestionnaire: true
        })

        await AdministrationsTitresTypesTitresStatuts.query().delete()

        const q = Titres.query()
        q.select(
          titresModificationSelectQuery(q, {
            role,
            administrationId
          }).as('modification')
        )

        const titre = await q.first()

        expect(titre?.modification).toBe(modification)
      }
    )

    test('une administration non gestionnaire ne peut pas modifier un titre', async () => {
      await Titres.query().insert({
        nom: idGenerate(),
        statutId: 'val',
        domaineId: 'm',
        typeId: 'arm'
      })

      await AdministrationsTitresTypes.query().delete()
      const administrationId = 'ope-ptmg-973-01'

      await AdministrationsTitresTypesTitresStatuts.query().delete()

      const q = Titres.query()
      q.select(
        titresModificationSelectQuery(q, {
          role: 'admin',
          administrationId
        }).as('modification')
      )

      const titre = await q.first()

      expect(titre?.modification).toBeFalsy()
    })

    test.each`
      role            | modification
      ${'super'}      | ${true}
      ${'lecteur'}    | ${false}
      ${'entreprise'} | ${false}
      ${'default'}    | ${false}
    `(
      'Vérifie si un profil $role peut modifier un titre',
      async ({ role, modification }: { role: Role; modification: boolean }) => {
        await Titres.query().insert({
          nom: idGenerate(),
          statutId: 'val',
          domaineId: 'm',
          typeId: 'arm'
        })
        const q = Titres.query()
        q.select(
          titresModificationSelectQuery(q, {
            role,
            administrationId: undefined
          }).as('modification')
        )

        const titre = await q.first()

        expect(titre?.modification).toBe(modification)
      }
    )
  })

  describe('titresArchive', () => {
    test('Vérifie si le statut archivé masque le titre', async () => {
      const archivedTitreId = idGenerate()
      const titreId = idGenerate()
      await Titres.query().insert([
        {
          id: archivedTitreId,
          nom: archivedTitreId,
          statutId: 'val',
          domaineId: 'm',
          typeId: 'arm',
          archive: true
        },
        {
          id: titreId,
          nom: titreId,
          statutId: 'val',
          domaineId: 'm',
          typeId: 'arm',
          archive: false
        }
      ])

      const q = Titres.query().whereIn('id', [archivedTitreId, titreId])
      titresQueryModify(q, userSuper)

      const titres = await q

      expect(titres).toHaveLength(1)
      expect(titres[0].id).toBe(titreId)
    })
  })
})
