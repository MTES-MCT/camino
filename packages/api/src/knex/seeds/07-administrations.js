const seeding = require('../seeding')
const { sortedAdministrations } = require('camino-common/src/administrations')

const seed = seeding(async ({ insert }) => {
  const administrations = sortedAdministrations.map(
    ({ id, typeId, regionId, departementId }) => ({
      id,
      typeId,
      regionId,
      departementId
    })
  )
  await insert('administrations', administrations)
})

module.exports = seed

module.exports.seed = seed
