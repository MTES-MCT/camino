import { dbManager } from '../../../../tests/db-manager'
import DemarchesTypes from '../../models/demarches-types'
import { demarchesTypesQueryModify } from './metas'
import { idGenerate } from '../../models/_format/id-create'
import Titres from '../../models/titres'
import { IDemarcheType } from '../../../types'
import AdministrationsTitresTypesTitresStatuts from '../../models/administrations-titres-types-titres-statuts'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { getTitreTypeIdsByAdministration } from 'camino-common/src/static/administrationsTitresTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'

console.info = jest.fn()
console.error = jest.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('metas permissions queries', () => {
  describe('demarchesTypesQueryModify', () => {
    test.each`
      administrationId          | travauxCreation
      ${'dre-ile-de-france-01'} | ${true}
      ${'dea-guyane-01'}        | ${true}
      ${'min-mtes-dgec-01'}     | ${false}
      ${'ope-ptmg-973-01'}      | ${false}
    `(
      'l’administration $administrationId peut créer des travaux',
      async ({
        administrationId,
        travauxCreation
      }: {
        administrationId: AdministrationId
        travauxCreation: boolean
      }) => {
        const titreId = idGenerate()

        // On cherche un type de titre où l’administration est gestionnaire
        const titreTypeId: TitreTypeId | undefined =
          getTitreTypeIdsByAdministration(administrationId).find(
            att => att.gestionnaire
          )?.titreTypeId

        if (!titreTypeId) {
          throw new Error(
            'test impossible car cette administration n’est pas gestionnaire'
          )
        }

        await Titres.query().insert({
          id: titreId,
          nom: idGenerate(),
          titreStatutId: 'val',
          domaineId: 'm',
          typeId: titreTypeId
        })

        // On met une restriction sur les démarches du code minier sur ce type de titre
        await AdministrationsTitresTypesTitresStatuts.query().delete()
        await AdministrationsTitresTypesTitresStatuts.query().insert({
          administrationId,
          titreTypeId,
          titreStatutId: 'val',
          titresModificationInterdit: false,
          demarchesModificationInterdit: true,
          etapesModificationInterdit: false
        })

        const q = DemarchesTypes.query()
        demarchesTypesQueryModify(
          q,
          { role: 'admin', administrationId },
          { titreId }
        )

        const demarchesTypes = (await q) as unknown as IDemarcheType[]

        // a le droit de créer/modifier des travaux mais pas des démarches
        demarchesTypes.forEach(dt => {
          if (dt.travaux && travauxCreation) {
            expect(dt.demarchesCreation).toBeTruthy()
          } else {
            expect(dt.demarchesCreation).toBeFalsy()
          }
        })
      }
    )
  })
})
