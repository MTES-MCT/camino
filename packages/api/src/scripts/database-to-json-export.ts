import '../init.js'

import { databaseToJsonExport } from '../tools/database-to-json/index.js'

databaseToJsonExport()
  .then(() => {
    process.exit()
  })
  .catch(() => {
    process.exit(1)
  })
