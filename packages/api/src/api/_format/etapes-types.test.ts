import { documentsTypesFormat } from './etapes-types.js'
import { describe, test, expect } from 'vitest'
import { DocumentType } from 'camino-common/src/static/documentsTypes.js'
describe('teste etapes types format', () => {
  test.each<
    [
      DocumentType[] | null | undefined,
      DocumentType[] | null | undefined,
      DocumentType[]
    ]
  >([
    [undefined, undefined, []],
    [[], undefined, []],
    [undefined, [], []],
    [
      [{ id: 'acr', nom: 'acr', optionnel: false }],
      undefined,
      [{ id: 'acr', nom: 'acr', optionnel: false }]
    ],
    [
      undefined,
      [{ id: 'acr', nom: 'acr', optionnel: false }],
      [{ id: 'acr', nom: 'acr', optionnel: false }]
    ],
    [
      [{ id: 'acr', nom: 'acr', optionnel: false }],
      [{ id: 'acr', nom: 'acr', optionnel: true }],
      [{ id: 'acr', nom: 'acr', optionnel: true }]
    ],
    [
      [{ id: 'acr', nom: 'acr', optionnel: true }],
      [{ id: 'acr', nom: 'acr', optionnel: false }],
      [{ id: 'acr', nom: 'acr', optionnel: false }]
    ]
  ])(
    'documentsTypesFormat',
    (documentsTypes, documentsTypesSpecifiques, result) => {
      expect(
        documentsTypesFormat(documentsTypes, documentsTypesSpecifiques)
      ).toEqual(result)
    }
  )

  test.each([
    [undefined, undefined, undefined],
    ['des', undefined, 'des'],
    ['des', 'des2', 'des2'],
    [undefined, 'des2', 'des2']
  ])(
    'test la déclaration de la description',
    (description, dtSpecifiqueDescription, result) => {
      expect(
        documentsTypesFormat(
          [
            {
              id: 'acr',
              nom: 'test',
              optionnel: false,
              description
            }
          ],
          [
            {
              id: 'acr',
              nom: 'test',
              optionnel: false,
              description: dtSpecifiqueDescription
            }
          ]
        )[0].description
      ).toEqual(result)
    }
  )
})
