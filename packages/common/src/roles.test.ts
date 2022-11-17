import { isEntreprise, isSuper, isAdministration, isAdministrationEditeur, isAdministrationAdmin, isAdministrationLecteur, isDefault, isRole, ROLES, isBureauDEtudes } from './roles'
import { ADMINISTRATION_IDS } from './static/administrations'
import { test, expect, describe } from 'vitest'
const administrationId = ADMINISTRATION_IDS.CACEM
describe('role', () => {
  test('isSuper', () => {
    expect(isSuper({ role: 'super', administrationId: undefined })).toBe(true)
    expect(isSuper({ role: 'entreprise', administrationId: undefined })).toBe(false)
    expect(isSuper(undefined)).toBe(false)
  })

  test('isAdministration', () => {
    expect(isAdministration({ role: 'admin', administrationId: undefined })).toBe(false)
    expect(isAdministration({ role: 'editeur', administrationId: undefined })).toBe(false)
    expect(isAdministration({ role: 'lecteur', administrationId: undefined })).toBe(false)
    expect(isAdministration({ role: 'super', administrationId: undefined })).toBe(false)
    expect(isAdministration(undefined)).toBe(false)

    expect(isAdministration({ role: 'admin', administrationId })).toBe(true)
    expect(isAdministration({ role: 'editeur', administrationId })).toBe(true)
    expect(isAdministration({ role: 'lecteur', administrationId })).toBe(true)
  })
  test('isAdministrationAdmin', () => {
    expect(isAdministrationAdmin({ role: 'admin', administrationId: undefined })).toBe(false)
    expect(isAdministrationAdmin({ role: 'admin', administrationId })).toBe(true)
    expect(isAdministrationAdmin({ role: 'editeur', administrationId })).toBe(false)
  })
  test('isAdministrationEditeur', () => {
    expect(isAdministrationEditeur({ role: 'editeur', administrationId: undefined })).toBe(false)
    expect(isAdministrationEditeur({ role: 'editeur', administrationId })).toBe(true)
  })

  test('isAdministrationLecteur', () => {
    expect(isAdministrationLecteur({ role: 'lecteur', administrationId: undefined })).toBe(false)
    expect(isAdministrationLecteur({ role: 'lecteur', administrationId })).toBe(true)
    expect(isAdministrationLecteur({ role: 'admin', administrationId: undefined })).toBe(false)
  })

  test('isEntreprise', () => {
    expect(isEntreprise({ role: 'entreprise', administrationId: undefined })).toBe(true)
    expect(isEntreprise({ role: 'defaut', administrationId: undefined })).toBe(false)
  })
  test('isBureauDEtudes', () => {
    expect(isBureauDEtudes({ role: 'bureau d’études', administrationId: undefined })).toBe(true)
    expect(isBureauDEtudes({ role: 'defaut', administrationId: undefined })).toBe(false)
  })
  test('isDefault', () => {
    expect(isDefault(undefined)).toBe(true)
    expect(isDefault(null)).toBe(true)
    expect(isDefault({ role: 'defaut', administrationId: undefined })).toBe(true)
    expect(isDefault({ role: 'entreprise', administrationId: undefined })).toBe(false)
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
