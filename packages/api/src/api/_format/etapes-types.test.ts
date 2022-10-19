import { documentsTypesFormat } from './etapes-types'

describe('teste etapes types format', () => {
  test.each`
    documentsTypes                       | documentsTypesSpecifiques            | result
    ${undefined}                         | ${undefined}                         | ${[]}
    ${[]}                                | ${undefined}                         | ${[]}
    ${undefined}                         | ${[]}                                | ${[]}
    ${[{ id: 'acr', optionnel: false }]} | ${undefined}                         | ${[{ id: 'acr', optionnel: false }]}
    ${undefined}                         | ${[{ id: 'acr', optionnel: false }]} | ${[{ id: 'acr', optionnel: false }]}
    ${[{ id: 'acr', optionnel: false }]} | ${[{ id: 'acr', optionnel: true }]}  | ${[{ id: 'acr', optionnel: true }]}
    ${[{ id: 'acr', optionnel: true }]}  | ${[{ id: 'acr', optionnel: false }]} | ${[{ id: 'acr', optionnel: false }]}
  `(
    'documentsTypesFormat',
    ({ documentsTypes, documentsTypesSpecifiques, result }) => {
      expect(
        documentsTypesFormat(documentsTypes, documentsTypesSpecifiques)
      ).toEqual(result)
    }
  )

  test.each`
    description  | dtSpecifiqueDescription | result
    ${undefined} | ${undefined}            | ${undefined}
    ${'des'}     | ${undefined}            | ${'des'}
    ${'des'}     | ${'des2'}               | ${'des2'}
    ${undefined} | ${'des2'}               | ${'des2'}
  `(
    'test la déclaration de la description',
    ({ description, dtSpecifiqueDescription, result }) => {
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
