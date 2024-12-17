import { expect, test } from 'vitest'

import { CaminoMachines, machineFind } from './machines'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { demarcheEnregistrementDemandeDateFind } from 'camino-common/src/demarche'
import { DemarcheWithEtapeForMachinesTest } from '../../tools/demarches/tests-creation'
const etapesProdSpecifiqueArmAxm = require('./machines-cases.json') // eslint-disable-line

// pour regénérer le machines-cases.json: `npm run test:generate-data -w packages/api`
test.each(etapesProdSpecifiqueArmAxm as DemarcheWithEtapeForMachinesTest[])('cas réel N°$id', demarche => {
  const firstEtapeDate = demarcheEnregistrementDemandeDateFind(demarche.etapes.map(etape => ({ ...etape, typeId: etape.etapeTypeId })))
  let machine: CaminoMachines | undefined
  if (isNotNullNorUndefined(firstEtapeDate)) {
    machine = machineFind(demarche.titreTypeId, demarche.demarcheTypeId, demarche.id, firstEtapeDate)
  }
  if (isNullOrUndefined(machine)) {
    throw new Error(`Impossible de trouver une machine alors qu'on aurait du avoir ${demarche.machineId}, ${demarche.id}`)
  }
  machine.interpretMachine(demarche.etapes)
  expect(machine.demarcheStatut(demarche.etapes), `${demarche.machineId}`).toStrictEqual(demarche.statut)
})
