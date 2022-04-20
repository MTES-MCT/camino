import { IContenuValeur, ITitreEtape } from '../../types'

import { restrictionsArmRet } from './arm/ret'
import { restrictionsArmRenPro } from './arm/ren-pro'
import { restrictionsAxmOct } from './axm/oct'
import { etatsDefinitionPrmOct } from './prm/oct'
import { AnyStateMachine } from 'xstate'
import { armOctMachine } from './arm/oct.machine'
import { titreDemarcheDepotDemandeDateFind } from '../rules/titre-demarche-depot-demande-date-find'

interface IEtapeTypeIdCondition {
  etapeTypeId?: string
  statutId?: string
  titre?: ITitreCondition
  contextCheck?: (_etapes: ITitreEtape[]) => boolean
}

interface IDemarcheDefinitionRestrictions {
  [key: string]: IDemarcheDefinitionRestrictionsProps
}

interface IDemarcheDefinitionRestrictionsProps {
  separation?: string[]
  final?: boolean
  avant?: IEtapeTypeIdCondition[][]
  apres?: IEtapeTypeIdCondition[][]
  justeApres: IEtapeTypeIdCondition[][]
}

interface IDemarcheDefinitionRestrictionsElements
  extends IDemarcheDefinitionRestrictionsProps {
  etapeTypeId?: string
}
type IDemarcheDefinition =
  | DemarcheDefinitionRestriction
  | DemarcheDefinitionMachine

export const isDemarcheDefinitionRestriction = (
  dd: IDemarcheDefinition
): dd is DemarcheDefinitionRestriction => {
  return 'restrictions' in dd
}
export const isDemarcheDefinitionMachine = (
  dd: IDemarcheDefinition | undefined
): dd is DemarcheDefinitionMachine => {
  return dd !== undefined && 'machine' in dd
}

interface DemarcheDefinitionCommon {
  titreTypeId: string
  demarcheTypeIds: string[]
  dateDebut: string
}
export interface DemarcheDefinitionRestriction
  extends DemarcheDefinitionCommon {
  restrictions: IDemarcheDefinitionRestrictions
}
export interface DemarcheDefinitionMachine extends DemarcheDefinitionCommon {
  machine: AnyStateMachine
}

type IContenuOperation = {
  valeur: IContenuValeur
  operation?: 'NOT_EQUAL' | 'EQUAL'
}

interface IContenuElementCondition {
  [id: string]: IContenuOperation | undefined
}

interface IContenuCondition {
  [id: string]: IContenuElementCondition
}

interface ITitreCondition {
  statutId?: string
  contenu: IContenuCondition
}

const demarchesDefinitions: IDemarcheDefinition[] = [
  {
    titreTypeId: 'arm',
    demarcheTypeIds: ['oct'],
    machine: armOctMachine,
    dateDebut: '2019-10-31'
  },
  {
    titreTypeId: 'arm',
    demarcheTypeIds: ['ret'],
    restrictions: restrictionsArmRet,
    dateDebut: '2019-10-31'
  },
  {
    titreTypeId: 'arm',
    demarcheTypeIds: ['ren', 'pro'],
    restrictions: restrictionsArmRenPro,
    dateDebut: '2019-10-31'
  },
  {
    titreTypeId: 'prm',
    demarcheTypeIds: ['oct'],
    restrictions: etatsDefinitionPrmOct,
    dateDebut: '2019-10-31'
  },
  {
    titreTypeId: 'axm',
    demarcheTypeIds: ['oct'],
    restrictions: restrictionsAxmOct,
    // https://camino.beta.gouv.fr/titres/m-ax-crique-tumuc-humac-2020
    dateDebut: '2020-09-30'
  }
]

const demarcheDefinitionFind = (
  titreTypeId: string,
  demarcheTypeId: string,
  titreEtapes?: Pick<ITitreEtape, 'date' | 'typeId'>[]
) => {
  const date = titreDemarcheDepotDemandeDateFind(titreEtapes ?? [])

  return demarchesDefinitions
    .sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))
    .find(
      d =>
        (!date || d.dateDebut < date) &&
        d.titreTypeId === titreTypeId &&
        d.demarcheTypeIds.includes(demarcheTypeId)
    )
}

export {
  demarchesDefinitions,
  demarcheDefinitionFind,
  ITitreCondition,
  IDemarcheDefinitionRestrictions,
  IDemarcheDefinitionRestrictionsProps,
  IDemarcheDefinitionRestrictionsElements,
  IEtapeTypeIdCondition,
  IDemarcheDefinition,
  IContenuElementCondition
}
