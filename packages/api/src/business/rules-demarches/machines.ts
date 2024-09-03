import type { ArmOctMachine } from './arm/oct.machine'
import type { ArmRenProMachine } from './arm/ren-pro.machine'
import type { AxmOctMachine } from './axm/oct.machine'
import type { AxmProMachine } from './axm/pro.machine'
import type { PrmOctMachine } from './prm/oct.machine'
import type { ProcedureSimplifieeMachine } from './procedure-simplifiee/ps.machine'
import type { ProcedureSpecifiqueMachine } from './procedure-specifique/procedure-specifique.machine'

export type CaminoMachines = ArmOctMachine | AxmOctMachine | AxmProMachine | ArmRenProMachine | PrmOctMachine | ProcedureSimplifieeMachine | ProcedureSpecifiqueMachine
