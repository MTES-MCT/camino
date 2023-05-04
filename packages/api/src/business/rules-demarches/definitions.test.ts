import { demarchesDefinitions, IEtapeTypeIdCondition, isDemarcheDefinitionMachine, isDemarcheDefinitionRestriction } from './definitions.js'
import { restrictionsArmRet } from './arm/ret.js'
import { ArmOctMachine } from './arm/oct.machine.js'
import { expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { getEtapesTDE } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index.js'
import { EtapesTypes, isEtapeTypeId } from 'camino-common/src/static/etapesTypes.js'

test('isDemarcheDefinitionMachine', () => {
  expect(
    isDemarcheDefinitionMachine({
      titreTypeId: 'pxm',
      demarcheTypeIds: [],
      dateDebut: toCaminoDate('2022-01-01'),
      machine: new ArmOctMachine(),
    })
  ).toBe(true)
  expect(
    isDemarcheDefinitionMachine({
      titreTypeId: 'pxm',
      demarcheTypeIds: [],
      dateDebut: toCaminoDate('2022-01-01'),
      restrictions: restrictionsArmRet,
    })
  ).toBe(false)
  expect(isDemarcheDefinitionMachine(undefined)).toBe(false)
})
test('isDemarcheDefinitionRestriction', () => {
  expect(
    isDemarcheDefinitionRestriction({
      titreTypeId: 'pxm',
      demarcheTypeIds: [],
      dateDebut: toCaminoDate('2022-01-01'),
      machine: new ArmOctMachine(),
    })
  ).toBe(false)
  expect(
    isDemarcheDefinitionRestriction({
      titreTypeId: 'pxm',
      demarcheTypeIds: [],
      dateDebut: toCaminoDate('2022-01-01'),
      restrictions: restrictionsArmRet,
    })
  ).toBe(true)
})

test('tdeValidate', () => {
  const etapeTypeIdsGet = (contraintes?: IEtapeTypeIdCondition[][]) => {
    const etapeTypeIds = [] as string[]
    if (contraintes?.length) {
      contraintes.forEach(contrainte => {
        contrainte.forEach(c => {
          if (c.etapeTypeId) {
            etapeTypeIds.push(c.etapeTypeId)
          }
        })
      })
    }

    return etapeTypeIds
  }

  const etapesTypesIdsGet = (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) => getEtapesTDE(titreTypeId, demarcheTypeId).filter(etapeTypeId => !EtapesTypes[etapeTypeId].dateFin)

  const errors: string[] = []

  const definitionsWithRestrictions = demarchesDefinitions.filter(isDemarcheDefinitionRestriction)

  for (const demarcheDefinition of definitionsWithRestrictions) {
    for (const demarcheTypeId of demarcheDefinition.demarcheTypeIds) {
      const demarcheEtatsEtapeTypeIds = Object.keys(demarcheDefinition.restrictions)
        .filter(isEtapeTypeId)
        .reduce((acc, etapeTypeId) => {
          acc.push(etapeTypeId)
          const restriction = demarcheDefinition.restrictions[etapeTypeId]
          if (restriction?.separation) {
            acc.push(...restriction.separation)
          }
          acc.push(...etapeTypeIdsGet(restriction?.avant ?? []))
          acc.push(...etapeTypeIdsGet(restriction?.apres ?? []))
          acc.push(...etapeTypeIdsGet(restriction?.justeApres ?? []))

          return acc
        }, [] as string[])
        .map(type => type.split('-')[0])

      const tdeEtapeTypeIds = etapesTypesIdsGet(demarcheDefinition.titreTypeId, demarcheTypeId)

      // on vérifie que toutes les étapes définies dans l’arbre existent dans TDE
      demarcheEtatsEtapeTypeIds.forEach(demarcheEtatsEtapeTypeId => {
        if (!tdeEtapeTypeIds.includes(demarcheEtatsEtapeTypeId)) {
          errors.push(`titre "${demarcheDefinition.titreTypeId}" démarche "${demarcheTypeId}" étape "${demarcheEtatsEtapeTypeId}" présent dans l’arbre d’instructions mais pas dans TDE`)
        }
      })

      // on vérifie que toutes les étapes définies dans TDE existent dans l’arbre
      tdeEtapeTypeIds.forEach(tdeEtapeTypeId => {
        if (!demarcheEtatsEtapeTypeIds.includes(tdeEtapeTypeId)) {
          errors.push(`titre "${demarcheDefinition.titreTypeId}" démarche "${demarcheTypeId}" étape "${tdeEtapeTypeId}" présent dans TDE mais pas dans l’arbre d’instructions`)
        }
      })
    }
  }

  // on vérifie qu’il existe un bloc dans l’arbre par étapes définies dans TDE
  for (const demarcheDefinition of definitionsWithRestrictions) {
    for (const demarcheTypeId of demarcheDefinition.demarcheTypeIds) {
      const demarcheEtatsEtapeTypeIds = Object.keys(demarcheDefinition.restrictions)

      const tdeEtapeTypeIds = etapesTypesIdsGet(demarcheDefinition.titreTypeId, demarcheTypeId)

      tdeEtapeTypeIds.forEach(tdeEtapeTypeId => {
        if (!demarcheEtatsEtapeTypeIds.includes(tdeEtapeTypeId)) {
          errors.push(`bloc manquant "${tdeEtapeTypeId}" dans l’arbre des démarches "${demarcheTypeId}" des titres "${demarcheDefinition.titreTypeId}"`)
        }
      })
    }
  }

  expect(errors).toStrictEqual([])
})
