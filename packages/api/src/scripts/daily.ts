import '../init.js'

import daily from '../business/daily.js'

daily()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error('daily failed', e)
    process.exit(1)
  })
