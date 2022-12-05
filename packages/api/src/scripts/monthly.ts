import '../init.js'
import { monthly } from '../business/monthly.js'

monthly()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error('monthly en échec', e)
    process.exit(1)
  })
