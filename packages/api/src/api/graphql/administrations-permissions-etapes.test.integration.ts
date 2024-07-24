import { dbManager } from '../../../tests/db-manager'
import { creationCheck, visibleCheck } from '../../../tests/_utils/administrations-permissions'
import { afterAll, beforeAll, describe, test, vi } from 'vitest'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import type { Pool } from 'pg'
vi.mock('../../tools/dir-create', () => ({
  __esModule: true,
  default: vi.fn(),
}))

console.info = vi.fn()
console.error = vi.fn()

let dbPool: Pool
beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('Visibilité des étapes', () => {
  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['ope-onf-973-01', true, 'mcr'],
    ['min-mtes-dgaln-01', true, 'mcr'],
  ])("un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre ARM : $visible", async (administrationId, visible, etapeTypeId) =>
    visibleCheck(dbPool, administrationId, visible, 'etapes', 'arm', false, etapeTypeId)
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['ope-onf-973-01', true, 'mcr'],
    ['dea-guyane-01', true, 'mcr'],
    ['min-mtes-dgaln-01', true, 'mcr'],
  ])("un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre AXM : $visible", async (administrationId, visible, etapeTypeId) =>
    visibleCheck(dbPool, administrationId, visible, 'etapes', 'axm', false, etapeTypeId)
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([['min-mtes-dgaln-01', true, 'mcr']])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre CXM : $visible",
    async (administrationId, visible, etapeTypeId) => visibleCheck(dbPool, administrationId, visible, 'etapes', 'cxm', false, etapeTypeId)
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([['min-mtes-dgaln-01', true, 'mcr']])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre PRM : $visible",
    async (administrationId, visible, etapeTypeId) => visibleCheck(dbPool, administrationId, visible, 'etapes', 'prm', false, etapeTypeId)
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([['min-mtes-dgaln-01', true, 'mcr']])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre PXM : $visible",
    async (administrationId, visible, etapeTypeId) => visibleCheck(dbPool, administrationId, visible, 'etapes', 'pxm', false, etapeTypeId)
  )
})

describe('Création des étapes', () => {
  test('un utilisateur admin de l’administration min-mtes-dgaln-01 peut créer une étape $etapeTypeId sur un titre CXM', async () => {
    await creationCheck(dbPool, 'min-mtes-dgaln-01', true, 'etapes', 'cxm')
  })

  test('un utilisateur admin de l’administration "min-mtes-dgaln-01" peut créer une étape mfr sur un titre PRM', async () => {
    await creationCheck(dbPool, 'min-mtes-dgaln-01', true, 'etapes', 'prm')
  })

  test('un utilisateur admin de l’administration "min-mtes-dgaln-01" peut créer une étape mfr sur un titre PXM', async () => {
    await creationCheck(dbPool, 'min-mtes-dgaln-01', true, 'etapes', 'pxm')
  })
})
