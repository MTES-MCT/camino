import { dbManager } from '../../../tests/db-manager.js'
import {
  visibleCheck,
  creationCheck,
  modificationCheck
} from '../../../tests/_utils/administrations-permissions.js'
import { beforeEach, beforeAll, afterAll, test, describe, vi } from 'vitest'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import Utilisateurs from '../../database/models/utilisateurs.js'

console.info = vi.fn()
console.error = vi.fn()

// TODO 2022-06-27 we have a strange behavior between tests
beforeEach(async () => {
  await Utilisateurs.query().delete()
})

beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('Visibilité des démarches', () => {
  test.each<[AdministrationId, boolean]>([
    ['ope-onf-973-01', true],
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', true]
  ])(
    "un utilisateur admin de l’administration $administrationId peut voir les démarches d'un titre ARM : $visible",
    async (administrationId, visible) =>
      visibleCheck(administrationId, visible, 'demarches', 'arm', false)
  )

  test.each<[AdministrationId, boolean]>([
    ['ope-onf-973-01', true],
    ['dea-guyane-01', true],
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', true]
  ])(
    "un utilisateur admin de l’administration $administrationId peut voir les démarches d'un titre AXM : $visible",
    async (administrationId, visible) =>
      visibleCheck(administrationId, visible, 'demarches', 'axm', false)
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', true]
  ])(
    "un utilisateur admin de l’administration $administrationId peut voir les démarches d'un titre CXM : $visible",
    async (administrationId, visible) =>
      visibleCheck(administrationId, visible, 'demarches', 'cxm', false)
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', true]
  ])(
    "un utilisateur admin de l’administration $administrationId peut voir les démarches d'un titre PRM : $visible",
    async (administrationId, visible) =>
      visibleCheck(administrationId, visible, 'demarches', 'prm', false)
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', true]
  ])(
    "un utilisateur admin de l’administration $administrationId peut voir les démarches d'un titre PXM : $visible",
    async (administrationId, visible) =>
      visibleCheck(administrationId, visible, 'demarches', 'pxm', false)
  )
})

describe('Création des démarches', () => {
  test.each<[AdministrationId, boolean]>([
    ['ope-onf-973-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false]
  ])(
    "un utilisateur admin de l’administration $administrationId peut créer des démarches d'un titre ARM : $creer",
    async (administrationId, creer) =>
      creationCheck(administrationId, creer, 'demarches', 'arm')
  )

  test.each<[AdministrationId, boolean]>([
    ['ope-onf-973-01', true],
    ['dea-guyane-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false]
  ])(
    "un utilisateur admin de l’administration $administrationId peut créer des démarches d'un titre AXM : $creer",
    async (administrationId, creer) =>
      creationCheck(administrationId, creer, 'demarches', 'axm')
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', false],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false]
  ])(
    "un utilisateur admin de l’administration $administrationId peut créer des démarches d'un titre CXM : $creer",
    async (administrationId, creer) =>
      creationCheck(administrationId, creer, 'demarches', 'cxm')
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', false],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false]
  ])(
    "un utilisateur admin de l’administration $administrationId peut créer des démarches d'un titre PRM : $creer",
    async (administrationId, creer) =>
      creationCheck(administrationId, creer, 'demarches', 'prm')
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', false],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false]
  ])(
    "un utilisateur admin de l’administration $administrationId peut créer des démarches d'un titre PXM : $creer",
    async (administrationId, creer) =>
      creationCheck(administrationId, creer, 'demarches', 'pxm')
  )
})

describe('Modification des démarches', () => {
  test.each<[AdministrationId, boolean]>([
    ['ope-onf-973-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false]
  ])(
    "un utilisateur admin de l’administration $administrationId peut modifier des démarches d'un titre ARM : $modifier",
    async (administrationId, modifier) =>
      modificationCheck(administrationId, modifier, 'demarches', 'arm')
  )

  test.each<[AdministrationId, boolean]>([
    ['ope-onf-973-01', false],
    ['dea-guyane-01', true],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false]
  ])(
    "un utilisateur admin de l’administration $administrationId peut modifier des démarches d'un titre AXM : $modifier",
    async (administrationId, modifier) =>
      modificationCheck(administrationId, modifier, 'demarches', 'axm')
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', false],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false]
  ])(
    "un utilisateur admin de l’administration $administrationId peut modifier des démarches d'un titre CXM : $modifier",
    async (administrationId, modifier) =>
      modificationCheck(administrationId, modifier, 'demarches', 'cxm')
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', false],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false]
  ])(
    "un utilisateur admin de l’administration $administrationId peut modifier des démarches d'un titre PRM : $modifier",
    async (administrationId, modifier) =>
      modificationCheck(administrationId, modifier, 'demarches', 'prm')
  )

  test.each<[AdministrationId, boolean]>([
    ['min-mtes-dgec-01', false],
    ['min-mtes-dgaln-01', true],
    ['min-dajb-01', false]
  ])(
    "un utilisateur admin de l’administration $administrationId peut modifier des démarches d'un titre PXM : $modifier",
    async (administrationId, modifier) =>
      modificationCheck(administrationId, modifier, 'demarches', 'pxm')
  )
})
