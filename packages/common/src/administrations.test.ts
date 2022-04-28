import { sortedAdministrationTypes } from './administrations'

test('sortedAdministrationTypes', () => {
  expect(sortedAdministrationTypes).toMatchSnapshot()
})
