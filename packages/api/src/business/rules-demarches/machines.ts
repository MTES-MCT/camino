import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ArmOctMachine } from './arm/oct.machine'
import { ArmRenProMachine } from './arm/ren-pro.machine'
import { AxmOctMachine } from './axm/oct.machine'
import { AxmProMachine } from './axm/pro.machine'
import { PrmOctMachine } from './prm/oct.machine'
import { ProcedureSimplifieeMachine } from './procedure-simplifiee/ps.machine'
import { ProcedureSpecifiqueMachine } from './procedure-specifique/procedure-specifique.machine'
import { machineIdFind, type CaminoMachineId } from 'camino-common/src/machines'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { CaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { DeepReadonly, isNullOrUndefined } from 'camino-common/src/typescript-tools'

const machines = {
  ArmOct: () => new ArmOctMachine(),
  ArmRenPro: () => new ArmRenProMachine(),
  AxmOct: () => new AxmOctMachine(),
  AxmPro: () => new AxmProMachine(),
  PrmOct: () => new PrmOctMachine(),
  ProcedureSimplifiee: () => new ProcedureSimplifieeMachine(),
  ProcedureSpecifique: (titreTypeId, demarcheTypeId) => new ProcedureSpecifiqueMachine(titreTypeId, demarcheTypeId),
} as const satisfies Record<CaminoMachineId, (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) => CaminoMachines>

export const machineFind = (
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  titreEtapes: DeepReadonly<{ date: CaminoDate; typeId: EtapeTypeId }[]> | undefined,
  demarcheId: DemarcheId,
  overrideDate: CaminoDate | null = null
): CaminoMachines | undefined => {
  const machineId = machineIdFind(titreTypeId, demarcheTypeId, titreEtapes, demarcheId, overrideDate)
  if (isNullOrUndefined(machineId)) {
    return undefined
  }
  return getMachineFromId({ machineId, titreTypeId, demarcheTypeId })
}

export const getMachineFromId = (entry: { machineId: CaminoMachineId; titreTypeId: TitreTypeId; demarcheTypeId: DemarcheTypeId } | undefined): CaminoMachines | undefined =>
  entry === undefined ? undefined : machines[entry.machineId](entry.titreTypeId, entry.demarcheTypeId)
export type CaminoMachines = ArmOctMachine | AxmOctMachine | AxmProMachine | ArmRenProMachine | PrmOctMachine | ProcedureSimplifieeMachine | ProcedureSpecifiqueMachine
