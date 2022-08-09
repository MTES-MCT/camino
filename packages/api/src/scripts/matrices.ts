import { matrices } from '../business/matrices'

matrices()
  .then(() => {
    process.exit()
  })
  .catch(message => {
    console.error(message)
    process.exit(1)
  })
