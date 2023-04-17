import { ArmOctMachine } from './arm/oct.machine.js'
import { AxmOctMachine } from './axm/oct.machine.js'
import { AxmProMachine } from './axm/pro.machine.js'
import { PxgOctMachine } from './pxg/oct.machine.js'

export type CaminoMachines = ArmOctMachine | AxmOctMachine | PxgOctMachine | AxmProMachine
