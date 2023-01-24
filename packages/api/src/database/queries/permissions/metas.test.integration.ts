import { dbManager } from '../../../../tests/db-manager.js'
import DemarchesTypes from '../../models/demarches-types.js'
import { demarchesTypesQueryModify } from './metas.js'
import { idGenerate } from '../../models/_format/id-create.js'
import Titres from '../../models/titres.js'
import { IDemarcheType } from '../../../types.js'
import AdministrationsTitresTypesTitresStatuts from '../../models/administrations-titres-types-titres-statuts.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { getTitreTypeIdsByAdministration } from 'camino-common/src/static/administrationsTitresTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'

console.info = vi.fn()
console.error = vi.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('metas permissions queries', () => {
  describe('demarchesTypesQueryModify', () => {
    test.each<[AdministrationId, boolean]>([
      ['dre-ile-de-france-01', true],
      ['dea-guyane-01', true],
      ['min-mtes-dgec-01', false],
      ['ope-ptmg-973-01', false]
    ])(
      'l’administration $administrationId peut créer des travaux',
      async (administrationId, travauxCreation) => {
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
