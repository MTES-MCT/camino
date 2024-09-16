import { test, expect } from 'vitest'
import { isRadioElement, simpleContenuToFlattenedContenu, valeurFind } from './sections'
import { caminoDateValidator } from './date'

test('valeurFind', () => {
  expect(valeurFind({ id: 'camino', type: 'text', value: null, optionnel: false })).toBe('–')
  expect(valeurFind({ id: 'camino', type: 'text', value: '', optionnel: false })).toBe('–')
  expect(valeurFind({ id: 'camino', type: 'integer', value: 0, optionnel: false })).toBe('0')
  expect(valeurFind({ id: 'camino', type: 'number', value: 0, optionnel: false })).toBe('0')
  expect(
    valeurFind({
      id: 'camino',
      type: 'checkboxes',
      value: ['a', 'b'],
      options: [
        { id: 'a', nom: 'A' },
        { id: 'b', nom: 'B' },
      ],
      optionnel: false,
    })
  ).toBe('A, B')
  expect(
    valeurFind({
      id: 'camino',
      type: 'checkboxes',
      value: [],
      options: [
        { id: 'a', nom: 'A' },
        { id: 'b', nom: 'B' },
      ],
      optionnel: false,
    })
  ).toBe('–')
  expect(
    valeurFind({
      id: 'camino',
      type: 'select',
      value: 'a',
      options: [
        { id: 'a', nom: 'A' },
        { id: 'b', nom: 'B' },
      ],
      optionnel: false,
    })
  ).toBe('A')
  expect(
    valeurFind({
      id: 'camino',
      type: 'select',
      value: 'c',
      options: [
        { id: 'a', nom: 'A' },
        { id: 'b', nom: 'B' },
      ],
      optionnel: false,
    })
  ).toBe('-')
  expect(valeurFind({ id: 'camino', type: 'date', value: caminoDateValidator.parse('2000-01-01'), optionnel: false })).toBe('01-01-2000')
  expect(valeurFind({ id: 'camino', type: 'radio', value: true, optionnel: false })).toBe('Oui')
  expect(valeurFind({ id: 'camino', type: 'radio', value: false, optionnel: false })).toBe('Non')
  expect(valeurFind({ id: 'camino', type: 'checkbox', value: true, optionnel: false })).toBe('Oui')
  expect(valeurFind({ id: 'camino', type: 'checkbox', value: false, optionnel: false })).toBe('Non')
  expect(valeurFind({ id: 'camino', type: 'url', value: 'test', optionnel: false })).toBe('test')
})

test('isRadioElement', () => {
  expect(isRadioElement({ id: 'camino', type: 'radio', value: false, optionnel: false })).toBe(true)
  expect(isRadioElement({ id: 'camino', type: 'text', value: '', optionnel: false })).toBe(false)
})

test('simpleContenuToFlattenedContenu', () => {
  expect(
    simpleContenuToFlattenedContenu(
      'arm',
      'oct',
      'mfr',
      { arm: { mecanise: true } },
      { arm: { mecanise: { actif: true, etape: { date: caminoDateValidator.parse('2023-02-02'), typeId: 'mfr', contenu: { arm: { mecanise: false } } } } } }
    )
  ).toMatchInlineSnapshot(`
      {
        "arm": {
          "franchissements": {
            "etapeHeritee": null,
            "heritee": false,
            "value": null,
          },
          "mecanise": {
            "etapeHeritee": {
              "date": "2023-02-02",
              "etapeTypeId": "mfr",
              "value": false,
            },
            "heritee": true,
            "value": false,
          },
        },
      }
    `)
  expect(
    simpleContenuToFlattenedContenu(
      'arm',
      'oct',
      'mfr',
      { arm: { mecanise: true } },
      { arm: { mecanise: { actif: false, etape: { date: caminoDateValidator.parse('2023-02-02'), typeId: 'mfr', contenu: { arm: { mecanise: false } } } } } }
    )
  ).toMatchInlineSnapshot(`
      {
        "arm": {
          "franchissements": {
            "etapeHeritee": null,
            "heritee": false,
            "value": null,
          },
          "mecanise": {
            "etapeHeritee": {
              "date": "2023-02-02",
              "etapeTypeId": "mfr",
              "value": false,
            },
            "heritee": false,
            "value": true,
          },
        },
      }
    `)
})
