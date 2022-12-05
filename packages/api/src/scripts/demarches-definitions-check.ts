import '../init.js'
import demarchesDefinitionsCheck from '../tools/demarches/definitions-check.js'

demarchesDefinitionsCheck()
  .then(() => {
    process.exit()
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
