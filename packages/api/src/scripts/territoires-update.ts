import { updateTerritoires } from '../tools/territoires-update'

updateTerritoires().catch(e => {
  console.error(e)

  process.exit(1)
})
