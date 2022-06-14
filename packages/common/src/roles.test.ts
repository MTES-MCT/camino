import {
  isEntreprise,
  isSuper,
  isAdministration,
  isAdministrationEditeur,
  isAdministrationAdmin,
  isAdministrationLecteur,
  isDefault
} from './roles'

test('role check', () => {
  expect(isSuper({ role: 'super' })).toBe(true)
  expect(isSuper({ role: 'entreprise' })).toBe(false)
  expect(isAdministration({ role: 'admin' })).toBe(true)
  expect(isAdministration({ role: 'editeur' })).toBe(true)
  expect(isAdministration({ role: 'lecteur' })).toBe(true)
  expect(isAdministration({ role: 'super' })).toBe(false)
  expect(isAdministrationAdmin({ role: 'admin' })).toBe(true)
  expect(isAdministrationEditeur({ role: 'editeur' })).toBe(true)
  expect(isAdministrationLecteur({ role: 'lecteur' })).toBe(true)
  expect(isAdministrationLecteur({ role: 'admin' })).toBe(false)
  expect(isEntreprise({ role: 'entreprise' })).toBe(true)
  expect(isEntreprise({ role: 'defaut' })).toBe(false)
  expect(isDefault(undefined)).toBe(true)
  expect(isDefault(null)).toBe(true)
  expect(isDefault({ role: 'defaut' })).toBe(true)
  expect(isDefault({ role: 'entreprise' })).toBe(false)
})
