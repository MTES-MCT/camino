import { toCaminoDate } from 'camino-common/src/date.js'
import { AxmProMachine } from './axm/pro.machine.js'
import { AxmOctMachine } from './axm/oct.machine.js'
// const proMachine = new AxmProMachine()

// console.time('coucou')
//       console.log(proMachine.getBestNextStepToReach([], toCaminoDate('2021-02-06'), {
//         etapeTypeId: 'dex',
//         etapeStatutId: 'fai',
//       }))
// console.timeEnd('coucou')

const octMachine = new AxmOctMachine()

// console.time('coucou')
//       console.log(octMachine.getBestNextStepToReach([], toCaminoDate('2021-02-06'), {
//         etapeTypeId: 'dex',
//         etapeStatutId: 'fai',
//       }))
// console.timeEnd('coucou')
console.time('coucou')
      console.log(octMachine.getBestNextStepToReach([{
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
        date: toCaminoDate('2020-02-06'),
      }], toCaminoDate('2021-02-06'), {
        etapeTypeId: 'dex',
        etapeStatutId: 'fai',
      }))
console.timeEnd('coucou')

    

