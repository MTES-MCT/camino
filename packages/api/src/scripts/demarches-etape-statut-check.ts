import '../init.js'
import { etapeStatutCheck } from '../tools/demarches/etape-statut-check.js'

etapeStatutCheck()
  .then(() => {
    process.exit()
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
