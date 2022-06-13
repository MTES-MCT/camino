import { permissionCheck } from './roles'

test('permissionCheck', () => {
  expect(permissionCheck(null, [])).toBe(false)
  expect(permissionCheck(undefined, [])).toBe(false)
  expect(permissionCheck('defaut', ['entreprise'])).toBe(false)
  expect(permissionCheck('entreprise', ['defaut'])).toBe(false)

  // TODO 2022-06-02: je pensais que super avait tous les droits de toute façon ?
  expect(permissionCheck('super', [])).toBe(false)

  expect(permissionCheck('super', ['super'])).toBe(true)
  expect(permissionCheck('entreprise', ['super'])).toBe(false)
})
