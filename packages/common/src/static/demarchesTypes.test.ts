import { getValues } from '../typescript-tools'
import { sortedDemarchesStatuts } from './demarchesStatuts'
import {
  DEMARCHES_TYPES_IDS,
  isDemarcheTypeId,
  isDemarcheTypeOctroi,
  isDemarcheTypeWithPhase,
  canImpactTitre,
  isDemarcheTypeProlongations,
  isTravaux,
  isDemarcheTypeAnnulation,
} from './demarchesTypes'
import { test, expect } from 'vitest'

test('isDemarcheTypeId', () => {
  expect(isDemarcheTypeId(null)).toBe(false)
  expect(isDemarcheTypeId(undefined)).toBe(false)
  for (const demarcheType of Object.values(DEMARCHES_TYPES_IDS)) {
    expect(isDemarcheTypeId(demarcheType)).toBe(true)
  }
})

test('isDemarcheTypeOctroi', () => {
  for (const demarcheType of getValues(DEMARCHES_TYPES_IDS)) {
    expect(isDemarcheTypeOctroi(demarcheType)).toBe(
      [DEMARCHES_TYPES_IDS.Octroi, DEMARCHES_TYPES_IDS.MutationPartielle, DEMARCHES_TYPES_IDS.Fusion, DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation].includes(demarcheType)
    )
  }
})

test('isDemarcheTypeWithPhase', () => {
  const result = getValues(DEMARCHES_TYPES_IDS).flatMap(demarcheType => {
    return `${demarcheType} -> ${isDemarcheTypeWithPhase(demarcheType)}`
  })
  expect(result).toMatchInlineSnapshot(`
    [
      "amo -> false",
      "aom -> false",
      "ces -> false",
      "con -> false",
      "dam -> false",
      "dec -> false",
      "dep -> false",
      "dot -> false",
      "exp -> false",
      "exs -> false",
      "fus -> true",
      "mut -> false",
      "oct -> true",
      "pr1 -> true",
      "pr2 -> true",
      "pre -> true",
      "pro -> true",
      "prr -> true",
      "rec -> false",
      "rep -> false",
      "res -> false",
      "ret -> false",
      "vct -> true",
      "vut -> true",
    ]
  `)
})

test('isDemarcheTypeAnnulation', () => {
  const result = getValues(DEMARCHES_TYPES_IDS).flatMap(demarcheType => {
    return `${demarcheType} -> ${isDemarcheTypeAnnulation(demarcheType)}`
  })
  expect(result).toMatchInlineSnapshot(`
    [
      "amo -> false",
      "aom -> false",
      "ces -> false",
      "con -> false",
      "dam -> false",
      "dec -> false",
      "dep -> false",
      "dot -> false",
      "exp -> false",
      "exs -> false",
      "fus -> false",
      "mut -> false",
      "oct -> false",
      "pr1 -> false",
      "pr2 -> false",
      "pre -> false",
      "pro -> false",
      "prr -> false",
      "rec -> true",
      "rep -> false",
      "res -> false",
      "ret -> true",
      "vct -> false",
      "vut -> false",
    ]
  `)
})
test('canImpactTitre', () => {
  const result = getValues(DEMARCHES_TYPES_IDS).flatMap(demarcheType => {
    return sortedDemarchesStatuts.map(demarcheStatus => {
      return `${demarcheType} - ${demarcheStatus.id} -> ${canImpactTitre(demarcheType, demarcheStatus.id)}`
    })
  })
  expect(result).toMatchSnapshot()
})

test('isDemarcheTypeProlongations', () => {
  const result = getValues(DEMARCHES_TYPES_IDS).flatMap(demarcheType => {
    return `${demarcheType} -> ${isDemarcheTypeProlongations(demarcheType)}`
  })
  expect(result).toMatchSnapshot()
})

test('isTravaux', () => {
  const result = getValues(DEMARCHES_TYPES_IDS).flatMap(demarcheType => {
    return `${demarcheType} -> ${isTravaux(demarcheType)}`
  })
  expect(result).toMatchSnapshot()
})
