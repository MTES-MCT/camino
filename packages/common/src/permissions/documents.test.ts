import { describe, test, expect } from 'vitest'
import { isDocumentsComplete } from './documents.js'
describe('teste isDocumentsComplete', () => {
  test('tous les documents sont optionnels', () => {
    const errors = isDocumentsComplete([], [{ id: 'arr', optionnel: true }])
    expect(errors.valid).toBe(true)
  })

  test('il manque un document obligatoire', () => {
    const errors = isDocumentsComplete([], [{ id: 'arr', optionnel: false }])
    expect(errors.valid).toBe(false)
    expect(errors).toMatchInlineSnapshot(`
      {
        "errors": [
          "le document \\"arr\\" est obligatoire",
        ],
        "valid": false,
      }
    `)
  })

  test('il manque le fichier à un document obligatoire', () => {
    const errors = isDocumentsComplete(
      [
        {
          typeId: 'arr',
        },
      ],
      [{ id: 'arr', optionnel: false }]
    )
    expect(errors.valid).toBe(false)
    expect(errors).toMatchInlineSnapshot(`
      {
        "errors": [
          "le document \\"arr\\" est obligatoire",
        ],
        "valid": false,
      }
    `)
  })

  test('le document obligatoire est complet', () => {
    const errors = isDocumentsComplete(
      [
        {
          typeId: 'arr',
          fichier: true,
        },
      ],
      [{ id: 'arr', optionnel: false }]
    )
    expect(errors.valid).toBe(true)
  })
})
