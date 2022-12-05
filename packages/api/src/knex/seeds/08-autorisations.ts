import seeding from '../seeding.js'
/* eslint-disable camelcase */

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const administrations_activitesTypes = require('../../../sources/administrations--activites-types.json')
const administrations__titresTypes__titresStatuts = require('../../../sources/administrations--titres-types--titres-statuts.json')
const administrations__titresTypes__etapesTypes = require('../../../sources/administrations--titres-types--etapes-types.json')

export const seed = seeding(async ({ insert }) => {
  await Promise.all([
    insert(
      'administrations__titresTypes__titresStatuts',
      administrations__titresTypes__titresStatuts
    ),
    insert(
      'administrations__titresTypes__etapesTypes',
      administrations__titresTypes__etapesTypes
    ),
    insert('administrations__activitesTypes', administrations_activitesTypes)
  ])
})
