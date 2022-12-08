import { ADMINISTRATION_IDS, isAdministrationId, sortedAdministrationTypes } from './administrations.js'
import { test, expect } from 'vitest'

test('sortedAdministrationTypes', () => {
  expect(sortedAdministrationTypes).toMatchSnapshot()
})

test('isAdministrationId', () => {
  expect(isAdministrationId(null)).toBe(false)
  expect(isAdministrationId(undefined)).toBe(false)
  expect(isAdministrationId('notAnAdmin')).toBe(false)
  expect(isAdministrationId([ADMINISTRATION_IDS.BRGM])).toBe(false)

  Object.values(ADMINISTRATION_IDS).forEach(administrationId => expect(isAdministrationId(administrationId)).toBe(true))
})
