import seeding from '../seeding.js'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const activitesTypes = require('../../../sources/activites-types.json')

export const seed = seeding(async ({ insert }) => {
  await insert('activitesTypes', activitesTypes)
})
