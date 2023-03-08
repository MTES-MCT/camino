import { urlQueryParamsGet } from './url.js'
import { describe, expect, test } from 'vitest'

describe('urlQueryParamsGet', () => {
  test('récupère les paramètres de requête qui ont changé', () => {
    expect(urlQueryParamsGet({ typesIds: ['cx', 'pr'] }, { typeIds: 'ar' }, [{ id: 'typeIds', type: 'strings', values: ['cx', 'pr', 'ar'] }])).toEqual({})
  })
})
