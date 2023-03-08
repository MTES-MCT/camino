import seeding from '../seeding.js'
/* eslint-disable camelcase */

import { createRequire } from 'node:module'
import { toDbATE } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes.js'
import { toDbATT } from 'camino-common/src/static/administrationsTitresTypesTitresStatuts.js'

const require = createRequire(import.meta.url)

const administrations_activitesTypes = require('../../../sources/administrations--activites-types.json')

export const seed = seeding(async ({ insert }) => {
  await Promise.all([
    insert('administrations__titresTypes__titresStatuts', toDbATT()),
    insert('administrations__titresTypes__etapesTypes', toDbATE()),
    insert('administrations__activitesTypes', administrations_activitesTypes),
  ])
})
