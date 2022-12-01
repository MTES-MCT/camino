import seeding from '../seeding.js'
/* eslint-disable camelcase */

import administrations_activitesTypes from '../../../sources/administrations--activites-types.json' assert { type: 'json' }
import administrations__titresTypes__titresStatuts from '../../../sources/administrations--titres-types--titres-statuts.json' assert { type: 'json' }
import administrations__titresTypes__etapesTypes from '../../../sources/administrations--titres-types--etapes-types.json' assert { type: 'json' }

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
