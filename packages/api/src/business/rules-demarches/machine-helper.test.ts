import { toCaminoDate } from 'camino-common/src/date.js'
import { AxmProMachine } from './axm/pro.machine.js'
const proMachine = new AxmProMachine()

console.time('coucou')
      console.log(proMachine.getBestNextStepToReach([
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-01'),
        },
      ], toCaminoDate('2021-02-06'), {
        etapeTypeId: 'dex',
        etapeStatutId: 'fai',
      }))
console.timeEnd('coucou')

    

