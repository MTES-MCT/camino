import { test, expect } from 'vitest'
import { testBlankUser } from '../tests-utils'
import { canReadJournaux } from './journaux'

test('canReadJournaux', () => {
  expect(canReadJournaux({ ...testBlankUser, role: 'super' })).toBe(true)
})
