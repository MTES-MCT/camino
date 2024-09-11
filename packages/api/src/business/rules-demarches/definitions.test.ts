import { test, expect } from 'vitest'
import { machineFind } from './definitions'
import { toCaminoDate } from 'camino-common/src/date'
import { newDemarcheId } from '../../database/models/_format/id-create'

test('demarcheDefinitionFind retourne une machine', () => {
  expect(machineFind('prm', 'oct', [{ date: toCaminoDate('2023-06-07'), typeId: 'mdp' }], newDemarcheId('demarcheId'))).not.toBe(undefined)
})

test("demarcheDefinitionFind retourne une machine quand il n'y a pas d'étape", () => {
  expect(machineFind('prm', 'oct', [], newDemarcheId('demarcheId'))).not.toBe(undefined)
})

test('demarcheDefinitionFind ne retourne pas une machine quand la démarche fait partie des exceptions', () => {
  expect(machineFind('prm', 'oct', [{ date: toCaminoDate('2023-06-07'), typeId: 'mdp' }], newDemarcheId('FfJTtP9EEfvf3VZy81hpF7ms'))).toBe(undefined)
})

test('demarcheDefinitionFind ne retourne pas une machine quand les étapes sont trop anciennes', () => {
  expect(machineFind('prm', 'oct', [{ date: toCaminoDate('2010-06-07'), typeId: 'mdp' }], newDemarcheId('FfJTtP9EEfvf3VZy81hpF7ms'))).toBe(undefined)
})

test('demarcheDefinitionFind', () => {
  expect(machineFind('arm', 'pro', [{ date: toCaminoDate('2018-10-22'), typeId: 'def' }], newDemarcheId('Anything'))).toBe(undefined)
})
