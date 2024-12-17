import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ArmOctMachine } from './arm/oct.machine'
import { ArmRenProMachine } from './arm/ren-pro.machine'
import { AxmOctMachine } from './axm/oct.machine'
import { AxmProMachine } from './axm/pro.machine'
import { PrmOctMachine } from './prm/oct.machine'
import { ProcedureSimplifieeMachine } from './procedure-simplifiee/procedure-simplifiee.machine'
import { ProcedureSpecifiqueMachine } from './procedure-specifique/procedure-specifique.machine'
import { machineIdFind, type CaminoMachineId } from 'camino-common/src/machines'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { FirstEtapeDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'

const machines = {
  ArmOct: (titreTypeId, demarcheTypeId) => new ArmOctMachine(titreTypeId, demarcheTypeId),
  ArmRenPro: (titreTypeId, demarcheTypeId) => new ArmRenProMachine(titreTypeId, demarcheTypeId),
  AxmOct: (titreTypeId, demarcheTypeId) => new AxmOctMachine(titreTypeId, demarcheTypeId),
  AxmPro: (titreTypeId, demarcheTypeId) => new AxmProMachine(titreTypeId, demarcheTypeId),
  PrmOct: (titreTypeId, demarcheTypeId) => new PrmOctMachine(titreTypeId, demarcheTypeId),
  ProcedureSimplifiee: (titreTypeId, demarcheTypeId) => new ProcedureSimplifieeMachine(titreTypeId, demarcheTypeId),
  ProcedureSpecifique: (titreTypeId, demarcheTypeId) => new ProcedureSpecifiqueMachine(titreTypeId, demarcheTypeId),
} as const satisfies Record<CaminoMachineId, (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) => CaminoMachines>

export const machineFind = (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, demarcheId: DemarcheId, date: FirstEtapeDate): CaminoMachines | undefined => {
  const machineId = machineIdFind(titreTypeId, demarcheTypeId, demarcheId, date)
  if (isNullOrUndefined(machineId)) {
    return undefined
  }
  return getMachineFromId({ machineId, titreTypeId, demarcheTypeId })
}

export const getMachineFromId = (entry: { machineId: CaminoMachineId; titreTypeId: TitreTypeId; demarcheTypeId: DemarcheTypeId } | undefined): CaminoMachines | undefined =>
  entry === undefined ? undefined : machines[entry.machineId](entry.titreTypeId, entry.demarcheTypeId)
export type CaminoMachines = ArmOctMachine | AxmOctMachine | AxmProMachine | ArmRenProMachine | PrmOctMachine | ProcedureSimplifieeMachine | ProcedureSpecifiqueMachine
