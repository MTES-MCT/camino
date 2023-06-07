import {test, expect} from 'vitest'
import { demarcheDefinitionFind } from './definitions'
import { toCaminoDate } from 'camino-common/src/date'
import { newDemarcheId } from '../../database/models/_format/id-create'

test('demarcheDefinitionFind retourne une machine', () => {
  expect(demarcheDefinitionFind('prm', 'oct', [{date: toCaminoDate('2023-06-07'), typeId: 'mdp'}], newDemarcheId('demarcheId'))).not.toBeUndefined()
})

test('demarcheDefinitionFind retourne une machine quand il n\'y a pas d\'étape', () => {
  expect(demarcheDefinitionFind('prm', 'oct', [], newDemarcheId('demarcheId'))).not.toBeUndefined()
})

test('demarcheDefinitionFind ne retourne pas une machine quand la démarche fait partie des exceptions', () => {
  expect(demarcheDefinitionFind('prm', 'oct', [{date: toCaminoDate('2023-06-07'), typeId: 'mdp'}], newDemarcheId('FfJTtP9EEfvf3VZy81hpF7ms'))).toBeUndefined()
})

test('demarcheDefinitionFind ne retourne pas une machine quand les étapes sont trop anciennes', () => {
  expect(demarcheDefinitionFind('prm', 'oct', [{date: toCaminoDate('2010-06-07'), typeId: 'mdp'}], newDemarcheId('FfJTtP9EEfvf3VZy81hpF7ms'))).toBeUndefined()
})