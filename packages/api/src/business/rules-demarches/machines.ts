import type { ArmOctMachine } from './arm/oct.machine.js'
import type { ArmRenProMachine } from './arm/ren-pro.machine.js'
import type { AxmOctMachine } from './axm/oct.machine.js'
import type { AxmProMachine } from './axm/pro.machine.js'
import type { PrmOctMachine } from './prm/oct.machine.js'
import type { ProcedureSimplifieeMachine, ProcedureHistoriqueMachine } from './procedure-simplifiee/ps.machine.js'

export type CaminoMachines = ArmOctMachine | AxmOctMachine | AxmProMachine | ArmRenProMachine | PrmOctMachine | ProcedureSimplifieeMachine | ProcedureHistoriqueMachine
