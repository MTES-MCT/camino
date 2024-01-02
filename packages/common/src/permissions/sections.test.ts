import { sectionElementWithValueCompleteValidate, sectionsWithValueCompleteValidate } from './sections.js'
import { test, expect, describe } from 'vitest'
import { ElementWithValue } from '../sections.js'
import { CaminoDate, getCurrent } from '../date'

describe('sectionElementWithValueCompleteValidate', () => {
  test.each<[string | null, ElementWithValue['optionnel'], boolean]>([
    ['', false, false],
    [null, false, false],
    ['un texte', false, true],
    [null, true, true],
    [null, undefined, false],
    ['un text', undefined, true],
  ])('Pour élément text', (value, optionnel, expectedComplete) => {
    expect(sectionElementWithValueCompleteValidate({ type: 'text', value, optionnel })).toEqual(expectedComplete)
  })

  test.each<[number | null, ElementWithValue['optionnel'], boolean]>([
    [0, false, true],
    [null, false, false],
    [10, false, true],
    [null, true, true],
    [null, undefined, false],
    [10, undefined, true],
  ])('Pour élément number ou integer', (value, optionnel, expectedComplete) => {
    expect(sectionElementWithValueCompleteValidate({ type: 'number', value, optionnel })).toEqual(expectedComplete)
    expect(sectionElementWithValueCompleteValidate({ type: 'integer', value, optionnel })).toEqual(expectedComplete)
  })

  test.each<[boolean | null, ElementWithValue['optionnel'], boolean]>([
    [false, false, true],
    [null, false, false],
    [true, false, true],
    [null, true, true],
    [null, undefined, false],
    [true, undefined, true],
  ])('Pour élément radio', (value, optionnel, expectedComplete) => {
    expect(sectionElementWithValueCompleteValidate({ type: 'radio', value, optionnel })).toEqual(expectedComplete)
  })

  test.each<[boolean | null, ElementWithValue['optionnel'], boolean]>([
    [false, false, true],
    [null, false, true],
    [true, false, true],
    [null, true, true],
    [null, undefined, true],
    [true, undefined, true],
  ])('Pour élément checkbox', (value, optionnel, expectedComplete) => {
    expect(sectionElementWithValueCompleteValidate({ type: 'checkbox', value, optionnel })).toEqual(expectedComplete)
  })

  test.each<[string[], ElementWithValue['optionnel'], boolean]>([
    [[], false, true],
    [[], true, true],
    [[], undefined, true],
    [['item'], false, true],
    [['item'], true, true],
    [['item'], undefined, true],
  ])('Pour élément checkboxes', (value, optionnel, expectedComplete) => {
    expect(sectionElementWithValueCompleteValidate({ type: 'checkboxes', value, optionnel })).toEqual(expectedComplete)
  })

  test.each<[string | null, ElementWithValue['optionnel'], boolean]>([
    ['', false, false],
    [null, false, false],
    ['id1', false, true],
    [null, true, true],
    [null, undefined, false],
    ['id1', undefined, true],
  ])('Pour élément select', (value, optionnel, expectedComplete) => {
    expect(sectionElementWithValueCompleteValidate({ type: 'select', value, optionnel })).toEqual(expectedComplete)
  })

  test.each<[CaminoDate | null, ElementWithValue['optionnel'], boolean]>([
    [getCurrent(), false, true],
    [null, false, false],
    [null, true, true],
    [null, undefined, false],
    [getCurrent(), undefined, true],
  ])('Pour élément date', (value, optionnel, expectedComplete) => {
    expect(sectionElementWithValueCompleteValidate({ type: 'date', value, optionnel })).toEqual(expectedComplete)
  })

  test.each<[string | null, ElementWithValue['optionnel'], boolean]>([
    ['', false, false],
    [null, false, false],
    ['fileId', false, true],
    [null, true, true],
    [null, undefined, false],
    ['fileId', undefined, true],
  ])('Pour élément file', (value, optionnel, expectedComplete) => {
    expect(sectionElementWithValueCompleteValidate({ type: 'file', value, optionnel })).toEqual(expectedComplete)
  })
})

describe('sectionsWithValueCompleteValidate', () => {
  test('les sections sont complètes', () => {
    expect(sectionsWithValueCompleteValidate([])).length(0)
    expect(sectionsWithValueCompleteValidate([{ nom: 'section', elements: [] }])).length(0)
    expect(sectionsWithValueCompleteValidate([{ nom: 'section', elements: [{ nom: 'element', type: 'text', optionnel: true, value: '' }] }])).length(0)
  })

  test('les sections ne sont pas complètes', () => {
    expect(sectionsWithValueCompleteValidate([{ nom: 'section', elements: [{ nom: 'element', type: 'text', optionnel: false, value: '' }] }])).toMatchInlineSnapshot(`
      [
        "l’élément \\"element\\" de la section \\"section\\" est obligatoire",
      ]
    `)
    expect(
      sectionsWithValueCompleteValidate([
        {
          nom: 'section1',
          elements: [
            { nom: 'element1', type: 'text', optionnel: false, value: '' },
            { nom: 'element2', type: 'text', optionnel: false, value: '' },
          ],
        },
        {
          nom: 'section2',
          elements: [
            { nom: 'element1', type: 'text', optionnel: false, value: '' },
            { nom: 'element2', type: 'text', optionnel: false, value: '' },
          ],
        },
      ])
    ).toMatchInlineSnapshot(`
      [
        "l’élément \\"element1\\" de la section \\"section1\\" est obligatoire",
        "l’élément \\"element2\\" de la section \\"section1\\" est obligatoire",
        "l’élément \\"element1\\" de la section \\"section2\\" est obligatoire",
        "l’élément \\"element2\\" de la section \\"section2\\" est obligatoire",
      ]
    `)
  })
})
