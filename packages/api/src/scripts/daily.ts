import '../init'

import daily from '../business/daily'

daily()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error('daily failed', e)
    process.exit(1)
  })
