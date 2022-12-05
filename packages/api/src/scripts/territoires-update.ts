import { updateTerritoires } from '../tools/territoires-update.js'

updateTerritoires()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e)

    process.exit(1)
  })
