import { dbManager } from '../../../tests/db-manager.js'
import { creationCheck, visibleCheck } from '../../../tests/_utils/administrations-permissions.js'
import TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes from '../../database/models/titres-types--demarches-types-etapes-types-justificatifs-types.js'
import { afterAll, beforeEach, beforeAll, describe, test, vi } from 'vitest'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import Utilisateurs from '../../database/models/utilisateurs'
vi.mock('../../tools/dir-create', () => ({
  __esModule: true,
  default: vi.fn(),
}))

vi.mock('../../tools/file-stream-create', () => ({
  __esModule: true,
  default: vi.fn(),
}))
vi.mock('../../tools/file-delete', () => ({
  __esModule: true,
  default: vi.fn(),
}))
console.info = vi.fn()
console.error = vi.fn()

beforeEach(async () => {
  await Utilisateurs.query().delete()
})
beforeAll(async () => {
  await dbManager.populateDb()

  await TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes.query().delete()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('Visibilité des étapes', () => {
  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['ope-onf-973-01', true, 'mcr'],
    ['min-mtes-dgaln-01', true, 'mcr'],
  ])("un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre ARM : $visible", async (administrationId, visible, etapeTypeId) =>
    visibleCheck(administrationId, visible, 'etapes', 'arm', false, etapeTypeId)
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['ope-onf-973-01', true, 'mcr'],
    ['dea-guyane-01', true, 'mcr'],
    ['min-mtes-dgaln-01', true, 'mcr'],
  ])("un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre AXM : $visible", async (administrationId, visible, etapeTypeId) =>
    visibleCheck(administrationId, visible, 'etapes', 'axm', false, etapeTypeId)
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([['min-mtes-dgaln-01', true, 'mcr']])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre CXM : $visible",
    async (administrationId, visible, etapeTypeId) => visibleCheck(administrationId, visible, 'etapes', 'cxm', false, etapeTypeId)
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([['min-mtes-dgaln-01', true, 'mcr']])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre PRM : $visible",
    async (administrationId, visible, etapeTypeId) => visibleCheck(administrationId, visible, 'etapes', 'prm', false, etapeTypeId)
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([['min-mtes-dgaln-01', true, 'mcr']])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre PXM : $visible",
    async (administrationId, visible, etapeTypeId) => visibleCheck(administrationId, visible, 'etapes', 'pxm', false, etapeTypeId)
  )
})

describe('Création des étapes', () => {
  test.each<[AdministrationId]>([['min-mtes-dgaln-01']])('un utilisateur admin de l’administration $administrationId peut créer une étape $etapeTypeId sur un titre CXM', async administrationId =>
    creationCheck(administrationId, true, 'etapes', 'cxm')
  )

  test.each<[AdministrationId]>([['min-mtes-dgaln-01']])('un utilisateur admin de l’administration $administrationId peut créer une étape mfr sur un titre PRM', async administrationId =>
    creationCheck(administrationId, true, 'etapes', 'prm')
  )

  test.each<[AdministrationId]>([['min-mtes-dgaln-01']])('un utilisateur admin de l’administration $administrationId peut créer une étape mfr sur un titre PXM', async administrationId =>
    creationCheck(administrationId, true, 'etapes', 'pxm')
  )
})
