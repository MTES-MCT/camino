import { DemarcheId, IContenuValeur, ITitreEtape } from '../../types'

import { restrictionsArmRet } from './arm/ret'
import { restrictionsArmRenPro } from './arm/ren-pro'
import { etatsDefinitionPrmOct } from './prm/oct'
import { titreDemarcheDepotDemandeDateFind } from '../rules/titre-demarche-depot-demande-date-find'
import { CaminoMachines } from './machines'
import { ArmOctMachine } from './arm/oct.machine'
import { AxmOctMachine } from './axm/oct.machine'

export interface IEtapeTypeIdCondition {
  etapeTypeId?: string
  statutId?: string
  titre?: ITitreCondition
  contextCheck?: (_etapes: ITitreEtape[]) => boolean
}

export interface IDemarcheDefinitionRestrictions {
  [key: string]: IDemarcheDefinitionRestrictionsProps
}

export interface IDemarcheDefinitionRestrictionsProps {
  separation?: string[]
  final?: boolean
  avant?: IEtapeTypeIdCondition[][]
  apres?: IEtapeTypeIdCondition[][]
  justeApres: IEtapeTypeIdCondition[][]
}

export interface IDemarcheDefinitionRestrictionsElements
  extends IDemarcheDefinitionRestrictionsProps {
  etapeTypeId?: string
}
export type IDemarcheDefinition =
  | DemarcheDefinitionRestriction
  | DemarcheDefinitionMachine

export const isDemarcheDefinitionRestriction = (
  dd: IDemarcheDefinition | undefined
): dd is DemarcheDefinitionRestriction => {
  return dd !== undefined && 'restrictions' in dd
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
  demarcheIdExceptions?: DemarcheId[]
}
export interface DemarcheDefinitionRestriction
  extends DemarcheDefinitionCommon {
  restrictions: IDemarcheDefinitionRestrictions
}
export interface DemarcheDefinitionMachine extends DemarcheDefinitionCommon {
  machine: CaminoMachines
}

type IContenuOperation = {
  valeur: IContenuValeur
  operation?: 'NOT_EQUAL' | 'EQUAL'
}

export interface IContenuElementCondition {
  [id: string]: IContenuOperation | undefined
}

interface IContenuCondition {
  [id: string]: IContenuElementCondition
}

export interface ITitreCondition {
  statutId?: string
  contenu: IContenuCondition
}

export const demarchesDefinitions: IDemarcheDefinition[] = [
  {
    titreTypeId: 'arm',
    demarcheTypeIds: ['oct'],
    machine: new ArmOctMachine(),
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
    machine: new AxmOctMachine(),
    // https://camino.beta.gouv.fr/titres/m-ax-crique-tumuc-humac-2020
    dateDebut: '2020-09-30'
  }
]

export const demarcheDefinitionFind = (
  titreTypeId: string,
  demarcheTypeId: string,
  titreEtapes: Pick<ITitreEtape, 'date' | 'typeId'>[] | undefined,
  demarcheId: DemarcheId
): IDemarcheDefinition | undefined => {
  const date = titreDemarcheDepotDemandeDateFind(titreEtapes)

  const definition = demarchesDefinitions
    .sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))
    .find(
      d =>
        (!date || d.dateDebut < date) &&
        d.titreTypeId === titreTypeId &&
        d.demarcheTypeIds.includes(demarcheTypeId)
    )

  if (definition?.demarcheIdExceptions?.includes(demarcheId)) {
    return undefined
  }

  return definition
}
