import '../init.js'
import documentsCheck from '../tools/documents/check.js'

documentsCheck()
  .then(() => {
    process.exit()
  })
  .catch(() => {
    process.exit(1)
  })
