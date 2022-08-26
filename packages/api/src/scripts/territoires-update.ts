import { updateTerritoires } from '../tools/territoires-update'

updateTerritoires()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e)

    process.exit(1)
  })
