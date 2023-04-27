import { IContenuValeur, ITitreEtape } from '../../types.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { restrictionsArmRet } from './arm/ret.js'
import { restrictionsArmRenPro } from './arm/ren-pro.js'
import { etatsDefinitionPrmOct } from './prm/oct.js'
import { titreDemarcheDepotDemandeDateFind } from '../rules/titre-demarche-depot-demande-date-find.js'
import { CaminoMachines } from './machines.js'
import { ArmOctMachine } from './arm/oct.machine.js'
import { AxmOctMachine } from './axm/oct.machine.js'
import { AxmProMachine } from './axm/pro.machine.js'
import { PxgOctMachine } from './pxg/oct.machine.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'

export interface IEtapeTypeIdCondition {
  etapeTypeId?: string
  statutId?: string
  titre?: ITitreCondition
  contextCheck?: (_etapes: ITitreEtape[]) => boolean
}

export type IDemarcheDefinitionRestrictions = { [key in EtapeTypeId]?: IDemarcheDefinitionRestrictionsProps }

export interface IDemarcheDefinitionRestrictionsProps {
  separation?: string[]
  final?: boolean
  avant?: IEtapeTypeIdCondition[][]
  apres?: IEtapeTypeIdCondition[][]
  justeApres: IEtapeTypeIdCondition[][]
}

export interface IDemarcheDefinitionRestrictionsElements extends IDemarcheDefinitionRestrictionsProps {
  etapeTypeId?: string
}
export type IDemarcheDefinition = DemarcheDefinitionRestriction | DemarcheDefinitionMachine

export const isDemarcheDefinitionRestriction = (dd: IDemarcheDefinition | undefined): dd is DemarcheDefinitionRestriction => {
  return dd !== undefined && 'restrictions' in dd
}
export const isDemarcheDefinitionMachine = (dd: IDemarcheDefinition | undefined): dd is DemarcheDefinitionMachine => {
  return dd !== undefined && 'machine' in dd
}

interface DemarcheDefinitionCommon {
  titreTypeId: TitreTypeId
  demarcheTypeIds: DemarcheTypeId[]
  dateDebut: CaminoDate
  demarcheIdExceptions?: DemarcheId[]
}
export interface DemarcheDefinitionRestriction extends DemarcheDefinitionCommon {
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
    dateDebut: toCaminoDate('2019-10-31'),
  },
  {
    titreTypeId: 'arm',
    demarcheTypeIds: ['ret'],
    restrictions: restrictionsArmRet,
    dateDebut: toCaminoDate('2019-10-31'),
  },
  {
    titreTypeId: 'arm',
    demarcheTypeIds: ['ren', 'pro'],
    restrictions: restrictionsArmRenPro,
    dateDebut: toCaminoDate('2019-10-31'),
  },
  {
    titreTypeId: 'prm',
    demarcheTypeIds: ['oct'],
    restrictions: etatsDefinitionPrmOct,
    dateDebut: toCaminoDate('2019-10-31'),
  },
  {
    titreTypeId: 'axm',
    demarcheTypeIds: ['oct'],
    machine: new AxmOctMachine(),
    // https://camino.beta.gouv.fr/titres/m-ax-crique-tumuc-humac-2020
    dateDebut: toCaminoDate('2020-09-30'),
    demarcheIdExceptions: [
      newDemarcheId('C3rs92l1eci3mLvsAGkv7gVV'),
      newDemarcheId('YEWeODXiFb7xKJB2OQlTyc14'),
      // avis dgtm moins de 30 jours après la saisine des services
      newDemarcheId('ktPyoaDYzJi2faPMtAeKFZ5l'),
    ],
  },
  {
    titreTypeId: 'axm',
    demarcheTypeIds: ['pro'],
    machine: new AxmProMachine(),
    dateDebut: toCaminoDate('2000-01-01'),
    demarcheIdExceptions: [
      // Complète mais ne respectant pas le cacoo
      newDemarcheId('Fq6lCWTS6h8k5dAsG6LLm3Gw'),
      newDemarcheId('TlqKNgdYzYVrUXieMJAqWYBD'),
      newDemarcheId('ka8jUJq3ESxAdhE6QacBlqS8'),
      newDemarcheId('d2443R01mLB8Nv2ZAhNSZdx3'),
      newDemarcheId('Od6oeREEAXvUyvdQWUOgKhTS'),
      newDemarcheId('M7VhIeD27VR0kKrkPTQHyXeH'),
      newDemarcheId('VWBvpOx3n4dN7WCQoYUEC6vM'),
      newDemarcheId('A17SapPN5NzwSBEOeoagQcHt'),
      newDemarcheId('tuQqpnDSYhnTGlkkxTsDUf0r'),
      newDemarcheId('s8ONjdmsJivnfnhE4ENNVmOb'),
      newDemarcheId('nk5alZi7lSkxGVMlmsmyaqOv'),
      newDemarcheId('Eg3T3fvnJETbYBmd8BJYfc1h'),
      newDemarcheId('ohHg9uU2zd9m3MvF6yJ3KxLr'),
      newDemarcheId('zsDao5HywdHx7YRlWjEMklZJ'),
      newDemarcheId('51G6AmHKKX5wFjbN6zJ3kufK'),
      newDemarcheId('08eC26bUf4PCr6qj9Rl4Qa1F'),
      newDemarcheId('OBKZ23yRO6e4VP7MyXwgCp6U'),
    ],
  },
  {
    titreTypeId: 'pxg',
    demarcheTypeIds: ['oct'],
    machine: new PxgOctMachine(),
    // https://camino.beta.gouv.fr/titres/g-px-vallee-arena-2020
    dateDebut: toCaminoDate('2021-01-01'),
  },
]

export const demarcheDefinitionFind = (
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  titreEtapes: Pick<ITitreEtape, 'date' | 'typeId'>[] | undefined,
  demarcheId: DemarcheId
): IDemarcheDefinition | undefined => {
  const date = titreDemarcheDepotDemandeDateFind(titreEtapes)

  const definition = demarchesDefinitions
    .sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))
    .find(d => (!date || d.dateDebut < date) && d.titreTypeId === titreTypeId && d.demarcheTypeIds.includes(demarcheTypeId))

  if (definition?.demarcheIdExceptions?.includes(demarcheId)) {
    return undefined
  }

  return definition
}
