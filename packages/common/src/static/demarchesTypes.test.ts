import { getValues } from '../typescript-tools'
import { sortedDemarchesStatuts } from './demarchesStatuts'
import { DEMARCHES_TYPES_IDS, isDemarcheTypeId, isDemarcheTypeOctroi, isDemarcheTypeWithPhase, canImpactTitre, isDemarcheTypeProlongations } from './demarchesTypes'
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
  for (const demarcheType of getValues(DEMARCHES_TYPES_IDS)) {
    let expected = isDemarcheTypeOctroi(demarcheType)

    if (!expected) {
      expected = [DEMARCHES_TYPES_IDS.Prolongation, DEMARCHES_TYPES_IDS.Prolongation1, DEMARCHES_TYPES_IDS.Prolongation2, DEMARCHES_TYPES_IDS.ProlongationExceptionnelle].includes(demarcheType)
    }

    expect(isDemarcheTypeWithPhase(demarcheType)).toBe(expected)
  }
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
