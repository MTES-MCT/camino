import seeding from '../seeding.js'
/* eslint-disable camelcase */

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const administrations_activitesTypes = require('../../../sources/administrations--activites-types.json')

export const seed = seeding(async ({ insert }) => {
  await Promise.all([insert('administrations__activitesTypes', administrations_activitesTypes)])
})
