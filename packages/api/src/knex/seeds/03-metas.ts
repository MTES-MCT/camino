import seeding from '../seeding.js'
/* eslint-disable camelcase */
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const domaines = require('../../../sources/domaines.json')
const titresTypesTypes = require('../../../sources/titres-types-types.json')
const titresTypes = require('../../../sources/titres-types.json')
const demarchesTypes = require('../../../sources/demarches-types.json')
const etapesTypes = require('../../../sources/etapes-types.json')
const titresTypes_demarchesTypes_etapesTypes = require('../../../sources/titres-types--demarches-types--etapes-types.json')
const documentsTypes = require('../../../sources/documents-types.json')

export const seed = seeding(async ({ insert }) => {
  await Promise.all([
    insert('domaines', domaines),
    insert('titresTypesTypes', titresTypesTypes),
    insert('demarchesTypes', demarchesTypes),
    insert('etapesTypes', etapesTypes),
    insert('documentsTypes', documentsTypes),
  ])
  await Promise.all([insert('titresTypes', titresTypes)])
  await Promise.all([insert('titresTypes__demarchesTypes__etapesTypes', titresTypes_demarchesTypes_etapesTypes)])
})
