import { describe, expect, test } from 'vitest'
import { firstEtapeDateValidator } from './date'
import { DATE_DEBUT_PROCEDURE_SPECIFIQUE, isMachineWithConsentement, machineIdFind } from './machines'
import { demarcheIdValidator } from './demarche'

describe('machineFind', () => {
  test('demarcheDefinitionFind retourne une machine', () => {
    expect(machineIdFind('prm', 'oct', demarcheIdValidator.parse('demarcheId'), firstEtapeDateValidator.parse('2023-06-07'))).toStrictEqual('PrmOct')
  })

  test('demarcheDefinitionFind ne retourne pas une machine quand la démarche fait partie des exceptions', () => {
    expect(machineIdFind('prm', 'oct', demarcheIdValidator.parse('FfJTtP9EEfvf3VZy81hpF7ms'), firstEtapeDateValidator.parse('2023-06-07'))).toBe(undefined)
  })

  test('demarcheDefinitionFind ne retourne pas une machine quand les étapes sont trop anciennes', () => {
    expect(machineIdFind('prm', 'oct', demarcheIdValidator.parse('FfJTtP9EEfvf3VZy81hpF7ms'), firstEtapeDateValidator.parse('2010-06-07'))).toBe(undefined)
  })

  test('arm pro undef', () => {
    expect(machineIdFind('arm', 'pro', demarcheIdValidator.parse('Anything'), firstEtapeDateValidator.parse('2018-10-22'))).toBe(undefined)
  })

  test('demarcheDefinitionFind retourne ProcedureSpecfique dès sa date de début', () => {
    expect(machineIdFind('arm', 'oct', demarcheIdValidator.parse('Anything'), firstEtapeDateValidator.parse(DATE_DEBUT_PROCEDURE_SPECIFIQUE))).toBe('ProcedureSpecifique')
  })
})
describe('isMachineWithConsentement', () => {
  test('procedure specifique', () => {
    expect(isMachineWithConsentement('ProcedureSpecifique')).toBe(true)
  })
  test('autre machines', () => {
    expect(isMachineWithConsentement('ArmOct')).toBe(false)
  })
})
