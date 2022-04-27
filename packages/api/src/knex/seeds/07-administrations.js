const seeding = require('../seeding')
const { sortedAdministrations } = require('camino-common/src/administrations')

const seed = seeding(async ({ insert }) => {
  const administrations = sortedAdministrations.map(
    ({ id, region_id, departement_id }) => ({ id, region_id, departement_id })
  )
  await insert('administrations', administrations)
})

module.exports = seed

module.exports.seed = seed
