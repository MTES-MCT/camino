const seeding = require('../seeding')
const {
  sortedAdministrations
} = require('camino-common/src/static/administrations')

const seed = seeding(async ({ insert }) => {
  const administrations = sortedAdministrations.map(({ id }) => ({
    id
  }))
  await insert('administrations', administrations)
})

module.exports = seed

module.exports.seed = seed
