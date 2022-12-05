import { dbManager } from '../../../tests/db-manager.js'
import {
  creationCheck,
  modificationCheck,
  visibleCheck
} from '../../../tests/_utils/administrations-permissions.js'
import TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes from '../../database/models/titres-types--demarches-types-etapes-types-justificatifs-types.js'
import { afterAll, beforeAll, describe, test, vi } from 'vitest'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
vi.mock('../../tools/dir-create', () => ({
  __esModule: true,
  default: vi.fn()
}))

vi.mock('../../tools/file-stream-create', () => ({
  __esModule: true,
  default: vi.fn()
}))
vi.mock('../../tools/file-delete', () => ({
  __esModule: true,
  default: vi.fn()
}))
console.info = vi.fn()
console.error = vi.fn()
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
    ['min-mtes-dgaln-01', true, 'mcr']
  ])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre ARM : $visible",
    async (administrationId, visible, etapeTypeId) =>
      visibleCheck(
        administrationId,
        visible,
        'etapes',
        'arm',
        false,
        etapeTypeId
      )
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['ope-onf-973-01', true, 'mcr'],
    ['dea-guyane-01', true, 'mcr'],
    ['min-mtes-dgaln-01', true, 'mcr']
  ])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre AXM : $visible",
    async (administrationId, visible, etapeTypeId) =>
      visibleCheck(
        administrationId,
        visible,
        'etapes',
        'axm',
        false,
        etapeTypeId
      )
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['min-mtes-dgaln-01', true, 'mcr']
  ])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre CXM : $visible",
    async (administrationId, visible, etapeTypeId) =>
      visibleCheck(
        administrationId,
        visible,
        'etapes',
        'cxm',
        false,
        etapeTypeId
      )
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['min-mtes-dgaln-01', true, 'mcr']
  ])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre PRM : $visible",
    async (administrationId, visible, etapeTypeId) =>
      visibleCheck(
        administrationId,
        visible,
        'etapes',
        'prm',
        false,
        etapeTypeId
      )
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['min-mtes-dgaln-01', true, 'mcr']
  ])(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre PXM : $visible",
    async (administrationId, visible, etapeTypeId) =>
      visibleCheck(
        administrationId,
        visible,
        'etapes',
        'pxm',
        false,
        etapeTypeId
      )
  )
})

describe('Création des étapes', () => {
  test.each<[AdministrationId]>([['min-mtes-dgaln-01']])(
    'un utilisateur admin de l’administration $administrationId peut créer une étape $etapeTypeId sur un titre CXM',
    async administrationId =>
      creationCheck(administrationId, true, 'etapes', 'cxm')
  )

  test.each<[AdministrationId]>([['min-mtes-dgaln-01']])(
    'un utilisateur admin de l’administration $administrationId peut créer une étape mfr sur un titre PRM',
    async administrationId =>
      creationCheck(administrationId, true, 'etapes', 'prm')
  )

  test.each<[AdministrationId]>([['min-mtes-dgaln-01']])(
    'un utilisateur admin de l’administration $administrationId peut créer une étape mfr sur un titre PXM',
    async administrationId =>
      creationCheck(administrationId, true, 'etapes', 'pxm')
  )
})

describe('Modification des étapes', () => {
  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['ope-onf-973-01', true, 'mcr'],
    ['min-mtes-dgaln-01', true, 'mcr']
  ])(
    'un utilisateur admin de l’administration $administrationId peut modifier une étape $etapeTypeId sur un titre ARM : $modifier',
    async (administrationId, modifier, etapeTypeId) =>
      modificationCheck(
        administrationId,
        modifier,
        'etapes',
        'arm',
        false,
        etapeTypeId
      )
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['ope-onf-973-01', false, 'mcr'],
    ['dea-guyane-01', true, 'mcr'],
    ['min-mtes-dgaln-01', true, 'mcr']
  ])(
    'un utilisateur admin de l’administration $administrationId peut modifier une étape $etapeTypeId sur un titre AXM : $modifier',
    async (administrationId, modifier, etapeTypeId) =>
      modificationCheck(
        administrationId,
        modifier,
        'etapes',
        'axm',
        false,
        etapeTypeId
      )
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['min-mtes-dgaln-01', true, 'mcr']
  ])(
    'un utilisateur admin de l’administration $administrationId peut modifier une étape $etapeTypeId sur un titre CXM : $modifier',
    async (administrationId, modifier, etapeTypeId) =>
      modificationCheck(
        administrationId,
        modifier,
        'etapes',
        'cxm',
        false,
        etapeTypeId
      )
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['min-mtes-dgaln-01', true, 'mcr']
  ])(
    'un utilisateur admin de l’administration $administrationId peut modifier une étape $etapeTypeId sur un titre PRM : $modifier',
    async (administrationId, modifier, etapeTypeId) =>
      modificationCheck(
        administrationId,
        modifier,
        'etapes',
        'prm',
        false,
        etapeTypeId
      )
  )

  test.each<[AdministrationId, boolean, EtapeTypeId]>([
    ['min-mtes-dgaln-01', true, 'mcr']
  ])(
    'un utilisateur admin de l’administration $administrationId peut modifier une étape $etapeTypeId sur un titre PXM : $modifier',
    async (administrationId, modifier, etapeTypeId) =>
      modificationCheck(
        administrationId,
        modifier,
        'etapes',
        'pxm',
        false,
        etapeTypeId
      )
  )
})
