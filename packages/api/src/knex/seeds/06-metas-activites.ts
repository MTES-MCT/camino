import seeding from '../seeding.js'
/* eslint-disable camelcase */

import activitesStatuts from '../../../sources/activites-statuts.json' assert { type: 'json' }
import activitesTypes from '../../../sources/activites-types.json' assert { type: 'json' }
import activitesTypes__titresTypes from '../../../sources/activites-types--titres-types.json' assert { type: 'json' }
import activitesTypes_pays from '../../../sources/activites-types--pays.json' assert { type: 'json' }
import activitesTypes_documentsTypes from '../../../sources/activites-types--documents-types.json' assert { type: 'json' }

export const seed = seeding(async ({ insert }) => {
  await insert('activitesStatuts', activitesStatuts)
  await insert('activitesTypes', activitesTypes)
  await insert('activitesTypes__titresTypes', activitesTypes__titresTypes)
  await insert('activitesTypes__pays', activitesTypes_pays)
  await insert('activitesTypes__documentsTypes', activitesTypes_documentsTypes)
})
