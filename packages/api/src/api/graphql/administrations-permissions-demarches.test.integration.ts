import { dbManager } from '../../../tests/db-manager.js'
import { visibleCheck, creationCheck } from '../../../tests/_utils/administrations-permissions.js'
import { beforeAll, afterAll, test, describe, vi } from 'vitest'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import type { Pool } from 'pg'

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

describe('Visibilité des démarches', () => {
  test.each<[AdministrationId, boolean]>([
    ['ope-onf-973-01', true],
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', true],
  ])("un utilisateur admin de l’administration %s peut voir les démarches d'un titre ARM : $visible", async (administrationId, visible) =>
    visibleCheck(dbPool, administrationId, visible, 'demarches', 'arm', false)
  )

  test.each<[AdministrationId, boolean]>([
    ['ope-onf-973-01', true],
    ['dea-guyane-01', true],
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', true],
  ])("un utilisateur admin de l’administration %s peut voir les démarches d'un titre AXM : $visible", async (administrationId, visible) =>
    visibleCheck(dbPool, administrationId, visible, 'demarches', 'axm', false)
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', true],
  ])("un utilisateur admin de l’administration %s peut voir les démarches d'un titre CXM : $visible", async (administrationId, visible) =>
    visibleCheck(dbPool, administrationId, visible, 'demarches', 'cxm', false)
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', true],
  ])("un utilisateur admin de l’administration %s peut voir les démarches d'un titre PRM : $visible", async (administrationId, visible) =>
    visibleCheck(dbPool, administrationId, visible, 'demarches', 'prm', false)
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', true],
  ])("un utilisateur admin de l’administration %s peut voir les démarches d'un titre PXM : $visible", async (administrationId, visible) =>
    visibleCheck(dbPool, administrationId, visible, 'demarches', 'pxm', false)
  )
})

describe('Création des démarches', () => {
  test.each<[AdministrationId, boolean]>([
    ['ope-onf-973-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false],
  ])("un utilisateur admin de l’administration %s peut créer des démarches d'un titre ARM : %s", async (administrationId, creer) => creationCheck(dbPool, administrationId, creer, 'demarches', 'arm'))

  test.each<[AdministrationId, boolean]>([
    ['ope-onf-973-01', true],
    ['dea-guyane-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false],
  ])("un utilisateur admin de l’administration %s peut créer des démarches d'un titre AXM : %s", async (administrationId, creer) => creationCheck(dbPool, administrationId, creer, 'demarches', 'axm'))

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', false],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false],
  ])("un utilisateur admin de l’administration %s peut créer des démarches d'un titre CXM : %s", async (administrationId, creer) => creationCheck(dbPool, administrationId, creer, 'demarches', 'cxm'))

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false],
  ])("un utilisateur admin de l’administration %s peut créer des démarches d'un titre PRM : %s", async (administrationId, creer) => creationCheck(dbPool, administrationId, creer, 'demarches', 'prm'))

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', false],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false],
  ])("un utilisateur admin de l’administration %s peut créer des démarches d'un titre PXM : %s", async (administrationId, creer) => creationCheck(dbPool, administrationId, creer, 'demarches', 'pxm'))
})
