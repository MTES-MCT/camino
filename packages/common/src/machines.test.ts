import { describe, expect, test } from 'vitest'
import { toCaminoDate } from './date'
import { machineIdFind } from './machines'
import { demarcheIdValidator } from './demarche'

describe('machineFind', () => {
  test('demarcheDefinitionFind retourne une machine', () => {
    expect(machineIdFind('prm', 'oct', [{ date: toCaminoDate('2023-06-07'), typeId: 'mdp' }], demarcheIdValidator.parse('demarcheId'))).toStrictEqual('PrmOct')
  })

  test("demarcheDefinitionFind retourne une machine quand il n'y a pas d'étape", () => {
    expect(machineIdFind('prm', 'oct', [], demarcheIdValidator.parse('demarcheId'))).toStrictEqual('ProcedureSpecifique')
  })

  test('demarcheDefinitionFind ne retourne pas une machine quand la démarche fait partie des exceptions', () => {
    expect(machineIdFind('prm', 'oct', [{ date: toCaminoDate('2023-06-07'), typeId: 'mdp' }], demarcheIdValidator.parse('FfJTtP9EEfvf3VZy81hpF7ms'))).toBe(undefined)
  })

  test('demarcheDefinitionFind ne retourne pas une machine quand les étapes sont trop anciennes', () => {
    expect(machineIdFind('prm', 'oct', [{ date: toCaminoDate('2010-06-07'), typeId: 'mdp' }], demarcheIdValidator.parse('FfJTtP9EEfvf3VZy81hpF7ms'))).toBe(undefined)
  })

  test('arm pro undef', () => {
    expect(machineIdFind('arm', 'pro', [{ date: toCaminoDate('2018-10-22'), typeId: 'def' }], demarcheIdValidator.parse('Anything'))).toBe(undefined)
  })
})
