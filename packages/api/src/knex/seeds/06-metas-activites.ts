import seeding from '../seeding.js'
/* eslint-disable camelcase */
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const activitesStatuts = require('../../../sources/activites-statuts.json')
const activitesTypes = require('../../../sources/activites-types.json')
const activitesTypes__titresTypes = require('../../../sources/activites-types--titres-types.json')
const activitesTypes_pays = require('../../../sources/activites-types--pays.json')
const activitesTypes_documentsTypes = require('../../../sources/activites-types--documents-types.json')

export const seed = seeding(async ({ insert }) => {
  await insert('activitesStatuts', activitesStatuts)
  await insert('activitesTypes', activitesTypes)
  await insert('activitesTypes__titresTypes', activitesTypes__titresTypes)
  await insert('activitesTypes__pays', activitesTypes_pays)
  await insert('activitesTypes__documentsTypes', activitesTypes_documentsTypes)
})
