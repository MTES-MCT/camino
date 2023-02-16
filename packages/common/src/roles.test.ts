import {
  isEntreprise,
  isSuper,
  isAdministration,
  isAdministrationEditeur,
  isAdministrationAdmin,
  isAdministrationLecteur,
  isDefault,
  isRole,
  ROLES,
  isBureauDEtudes,
  BaseUserNotNull
} from './roles.js'
import { ADMINISTRATION_IDS } from './static/administrations.js'
import { test, expect, describe } from 'vitest'
const administrationId = ADMINISTRATION_IDS.CACEM
describe('role', () => {
  const baseRole: Omit<BaseUserNotNull, 'role'> = {
    email: '',
    id: '',
    nom: '',
    prenom: ''
  }
  test('isSuper', () => {
    expect(isSuper({ ...baseRole, role: 'super' })).toBe(true)
    expect(isSuper({ ...baseRole, role: 'entreprise', entreprises: [] })).toBe(false)
    expect(isSuper(undefined)).toBe(false)
  })

  test('isAdministration', () => {
    expect(isAdministration({ ...baseRole, role: 'super' })).toBe(false)
    expect(isAdministration(undefined)).toBe(false)

    expect(isAdministration({ ...baseRole, role: 'admin', administrationId })).toBe(true)
    expect(isAdministration({ ...baseRole, role: 'editeur', administrationId })).toBe(true)
    expect(isAdministration({ ...baseRole, role: 'lecteur', administrationId })).toBe(true)
  })
  test('isAdministrationAdmin', () => {
    expect(isAdministrationAdmin({ ...baseRole, role: 'admin', administrationId })).toBe(true)
    expect(isAdministrationAdmin({ ...baseRole, role: 'editeur', administrationId })).toBe(false)
  })
  test('isAdministrationEditeur', () => {
    expect(
      isAdministrationEditeur({
        ...baseRole,
        role: 'editeur',
        administrationId
      })
    ).toBe(true)
  })

  test('isAdministrationLecteur', () => {
    expect(
      isAdministrationLecteur({
        ...baseRole,
        role: 'lecteur',
        administrationId
      })
    ).toBe(true)
  })

  test('isEntreprise', () => {
    expect(
      isEntreprise({
        ...baseRole,
        role: 'entreprise',
        entreprises: []
      })
    ).toBe(true)
    expect(isEntreprise({ ...baseRole, role: 'defaut' })).toBe(false)
  })
  test('isBureauDEtudes', () => {
    expect(
      isBureauDEtudes({
        ...baseRole,
        role: 'bureau d’études',
        entreprises: []
      })
    ).toBe(true)
    expect(isBureauDEtudes({ ...baseRole, role: 'defaut' })).toBe(false)
  })
  test('isDefault', () => {
    expect(isDefault(undefined)).toBe(true)
    expect(isDefault(null)).toBe(true)
    expect(isDefault({ ...baseRole, role: 'defaut' })).toBe(true)
    expect(
      isDefault({
        ...baseRole,
        role: 'entreprise',
        entreprises: []
      })
    ).toBe(false)
  })
})

test('isRole', () => {
  for (const role of ROLES) {
    expect(isRole(role)).toBe(true)
  }
  expect(isRole('unRole')).toBe(false)
  expect(isRole('unAutreRole')).toBe(false)
  expect(isRole('')).toBe(false)
  expect(isRole(undefined)).toBe(false)
  expect(isRole(null)).toBe(false)
})
