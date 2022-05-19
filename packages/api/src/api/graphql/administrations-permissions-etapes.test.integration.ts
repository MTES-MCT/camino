import { dbManager } from '../../../tests/db-manager'
import {
  creationCheck,
  modificationCheck,
  visibleCheck
} from '../../../tests/_utils/administrations-permissions'
import TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes from '../../database/models/titres-types--demarches-types-etapes-types-justificatifs-types'
import TitresTypesDemarchesTypesEtapesTypesDocumentsTypes from '../../database/models/titres-types--demarches-types-etapes-types-documents-types'

jest.mock('../../tools/dir-create', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../../tools/file-stream-create', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../tools/file-delete', () => ({
  __esModule: true,
  default: jest.fn()
}))
console.info = jest.fn()
console.error = jest.fn()
beforeAll(async () => {
  await dbManager.populateDb()

  await TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes.query().delete()
  await TitresTypesDemarchesTypesEtapesTypesDocumentsTypes.query().delete()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('Visibilité des étapes', () => {
  test.each`
    administrationId       | visible | etapeTypeId
    ${'ope-onf-973-01'}    | ${true} | ${'mcr'}
    ${'min-mtes-dgaln-01'} | ${true} | ${'mcr'}
  `(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre ARM : $visible",
    async ({ administrationId, visible, etapeTypeId }) =>
      visibleCheck(
        administrationId,
        visible,
        'etapes',
        'arm',
        false,
        etapeTypeId
      )
  )

  test.each`
    administrationId       | visible | etapeTypeId
    ${'ope-onf-973-01'}    | ${true} | ${'mcr'}
    ${'dea-guyane-01'}     | ${true} | ${'mcr'}
    ${'min-mtes-dgaln-01'} | ${true} | ${'mcr'}
  `(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre AXM : $visible",
    async ({ administrationId, visible, etapeTypeId }) =>
      visibleCheck(
        administrationId,
        visible,
        'etapes',
        'axm',
        false,
        etapeTypeId
      )
  )

  test.each`
    administrationId       | visible | etapeTypeId
    ${'min-mtes-dgaln-01'} | ${true} | ${'mcr'}
  `(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre CXM : $visible",
    async ({ administrationId, visible, etapeTypeId }) =>
      visibleCheck(
        administrationId,
        visible,
        'etapes',
        'cxm',
        false,
        etapeTypeId
      )
  )

  test.each`
    administrationId       | visible | etapeTypeId
    ${'min-mtes-dgaln-01'} | ${true} | ${'mcr'}
  `(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre PRM : $visible",
    async ({ administrationId, visible, etapeTypeId }) =>
      visibleCheck(
        administrationId,
        visible,
        'etapes',
        'prm',
        false,
        etapeTypeId
      )
  )

  test.each`
    administrationId       | visible | etapeTypeId
    ${'min-mtes-dgaln-01'} | ${true} | ${'mcr'}
  `(
    "un utilisateur admin de l’administration $administrationId peut voir l'étape $etapeTypeId d'un titre PXM : $visible",
    async ({ administrationId, visible, etapeTypeId }) =>
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
  test.only.each`
    administrationId
    ${'ope-onf-973-01'}
    ${'min-mtes-dgaln-01'}
  `(
    'un utilisateur admin de l’administration $administrationId peut créer une étape mfr sur un titre ARM',
    async ({ administrationId }) =>
      creationCheck(administrationId, true, 'etapes', 'arm')
  )

  test.each`
    administrationId
    ${'ope-onf-973-01'}
    ${'dea-guyane-01'}
    ${'min-mtes-dgaln-01'}
  `(
    'un utilisateur admin de l’administration $administrationId peut créer une étape mfr sur un titre AXM',
    async ({ administrationId }) =>
      creationCheck(administrationId, true, 'etapes', 'axm')
  )

  test.each`
    administrationId
    ${'min-mtes-dgaln-01'}
  `(
    'un utilisateur admin de l’administration $administrationId peut créer une étape $etapeTypeId sur un titre CXM',
    async ({ administrationId }) =>
      creationCheck(administrationId, true, 'etapes', 'cxm')
  )

  test.each`
    administrationId
    ${'min-mtes-dgaln-01'}
  `(
    'un utilisateur admin de l’administration $administrationId peut créer une étape mfr sur un titre PRM',
    async ({ administrationId }) =>
      creationCheck(administrationId, true, 'etapes', 'prm')
  )

  test.each`
    administrationId
    ${'min-mtes-dgaln-01'}
  `(
    'un utilisateur admin de l’administration $administrationId peut créer une étape mfr sur un titre PXM',
    async ({ administrationId }) =>
      creationCheck(administrationId, true, 'etapes', 'pxm')
  )
})

describe('Modification des étapes', () => {
  test.each`
    administrationId       | modifier | etapeTypeId
    ${'ope-onf-973-01'}    | ${true}  | ${'mcr'}
    ${'min-mtes-dgaln-01'} | ${true}  | ${'mcr'}
  `(
    'un utilisateur admin de l’administration $administrationId peut modifier une étape $etapeTypeId sur un titre ARM : $modifier',
    async ({ administrationId, modifier, etapeTypeId }) =>
      modificationCheck(
        administrationId,
        modifier,
        'etapes',
        'arm',
        false,
        etapeTypeId
      )
  )

  test.each`
    administrationId       | modifier | etapeTypeId
    ${'ope-onf-973-01'}    | ${false} | ${'mcr'}
    ${'dea-guyane-01'}     | ${true}  | ${'mcr'}
    ${'min-mtes-dgaln-01'} | ${true}  | ${'mcr'}
  `(
    'un utilisateur admin de l’administration $administrationId peut modifier une étape $etapeTypeId sur un titre AXM : $modifier',
    async ({ administrationId, modifier, etapeTypeId }) =>
      modificationCheck(
        administrationId,
        modifier,
        'etapes',
        'axm',
        false,
        etapeTypeId
      )
  )

  test.each`
    administrationId       | modifier | etapeTypeId
    ${'min-mtes-dgaln-01'} | ${true}  | ${'mcr'}
  `(
    'un utilisateur admin de l’administration $administrationId peut modifier une étape $etapeTypeId sur un titre CXM : $modifier',
    async ({ administrationId, modifier, etapeTypeId }) =>
      modificationCheck(
        administrationId,
        modifier,
        'etapes',
        'cxm',
        false,
        etapeTypeId
      )
  )

  test.each`
    administrationId       | modifier | etapeTypeId
    ${'min-mtes-dgaln-01'} | ${true}  | ${'mcr'}
  `(
    'un utilisateur admin de l’administration $administrationId peut modifier une étape $etapeTypeId sur un titre PRM : $modifier',
    async ({ administrationId, modifier, etapeTypeId }) =>
      modificationCheck(
        administrationId,
        modifier,
        'etapes',
        'prm',
        false,
        etapeTypeId
      )
  )

  test.each`
    administrationId       | modifier | etapeTypeId
    ${'min-mtes-dgaln-01'} | ${true}  | ${'mcr'}
  `(
    'un utilisateur admin de l’administration $administrationId peut modifier une étape $etapeTypeId sur un titre PXM : $modifier',
    async ({ administrationId, modifier, etapeTypeId }) =>
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
