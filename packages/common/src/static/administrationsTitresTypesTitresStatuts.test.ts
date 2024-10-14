import { canAdministrationModifyTitres, getAdministrationTitresTypesTitresStatuts } from './administrationsTitresTypesTitresStatuts'
import { test, expect } from 'vitest'

test('canAdministrationModifyTitres', () => {
  expect(canAdministrationModifyTitres('aut-97300-01', 'arm', 'val')).toBe(true)
  expect(canAdministrationModifyTitres('dea-guyane-01', 'cxm', 'dmc')).toBe(false)
})

test('getAdministrationTitresTypesTitresStatuts', () => {
  expect(getAdministrationTitresTypesTitresStatuts('pre-97209-01')).toMatchInlineSnapshot(`[]`)
  expect(getAdministrationTitresTypesTitresStatuts('dea-guyane-01')).toMatchInlineSnapshot(`
    [
      {
        "demarchesModificationInterdit": true,
        "etapesModificationInterdit": false,
        "titreStatutId": "dmc",
        "titreTypeId": "cxm",
        "titresModificationInterdit": true,
      },
      {
        "demarchesModificationInterdit": true,
        "etapesModificationInterdit": false,
        "titreStatutId": "dmi",
        "titreTypeId": "cxm",
        "titresModificationInterdit": true,
      },
      {
        "demarchesModificationInterdit": true,
        "etapesModificationInterdit": false,
        "titreStatutId": "ech",
        "titreTypeId": "cxm",
        "titresModificationInterdit": true,
      },
      {
        "demarchesModificationInterdit": true,
        "etapesModificationInterdit": false,
        "titreStatutId": "ind",
        "titreTypeId": "cxm",
        "titresModificationInterdit": true,
      },
      {
        "demarchesModificationInterdit": true,
        "etapesModificationInterdit": false,
        "titreStatutId": "mod",
        "titreTypeId": "cxm",
        "titresModificationInterdit": true,
      },
      {
        "demarchesModificationInterdit": true,
        "etapesModificationInterdit": false,
        "titreStatutId": "sup",
        "titreTypeId": "cxm",
        "titresModificationInterdit": true,
      },
      {
        "demarchesModificationInterdit": true,
        "etapesModificationInterdit": false,
        "titreStatutId": "val",
        "titreTypeId": "cxm",
        "titresModificationInterdit": true,
      },
    ]
  `)
})
