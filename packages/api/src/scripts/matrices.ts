import { matrices } from '../business/matrices'

matrices(process.env.ANNEE ? Number.parseInt(process.env.ANNEE, 10) : 2021)
  .then(() => {
    process.exit()
  })
  .catch(message => {
    console.error(message)
    process.exit(1)
  })
