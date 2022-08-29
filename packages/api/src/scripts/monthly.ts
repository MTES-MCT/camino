import '../init'
import { monthly } from '../business/monthly'

monthly()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error('monthly en échec', e)
    process.exit(1)
  })
