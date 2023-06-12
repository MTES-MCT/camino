import type { ArmOctMachine } from './arm/oct.machine.js'
import type { ArmRenProMachine } from './arm/ren-pro.machine.js'
import type { AxmOctMachine } from './axm/oct.machine.js'
import type { AxmProMachine } from './axm/pro.machine.js'
import type { PrmOctMachine } from './prm/oct.machine.js'
import type { PxgOctMachine } from './pxg/oct.machine.js'

export type CaminoMachines = ArmOctMachine | AxmOctMachine | PxgOctMachine | AxmProMachine | ArmRenProMachine | PrmOctMachine
