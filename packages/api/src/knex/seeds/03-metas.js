const seeding = require('../seeding')

/* eslint-disable camelcase */

const domaines = require('../../../sources/domaines.json')
const titresTypesTypes = require('../../../sources/titres-types-types.json')
const titresTypes = require('../../../sources/titres-types.json')
const titresTypes_titresStatuts = require('../../../sources/titres-types--titres-statuts.json')
const phasesStatuts = require('../../../sources/phases-statuts.json')
const demarchesTypes = require('../../../sources/demarches-types.json')
const titresTypes__demarchesTypes = require('../../../sources/titres-types--demarches-types.json')
const etapesTypes = require('../../../sources/etapes-types.json')
const titresTypes_demarchesTypes_etapesTypes = require('../../../sources/titres-types--demarches-types--etapes-types.json')
const titresTypes_demarchesTypes_etapesTypes_documentsTypes = require('../../../sources/titres-types--demarches-types--etapes-types--documents-types.json')
const etapesTypes_documentsTypes = require('../../../sources/etapes-types--documents-types.json')
const etapesTypes_justificatifsTypes = require('../../../sources/etapes-types--justificatifs-types.json')
const entreprises_documentsTypes = require('../../../sources/entreprises--documents-types.json')
const documentsTypes = require('../../../sources/documents-types.json')
const referencesTypes = require('../../../sources/references-types.json')

const seed = (module.exports = seeding(async ({ insert }) => {
  await Promise.all([
    insert('domaines', domaines),
    insert('titresTypesTypes', titresTypesTypes),
    insert('phasesStatuts', phasesStatuts),
    insert('demarchesTypes', demarchesTypes),
    insert('etapesTypes', etapesTypes),
    insert('documentsTypes', documentsTypes),
    insert('referencesTypes', referencesTypes)
  ])
  await Promise.all([insert('titresTypes', titresTypes)])
  await Promise.all([
    insert('titresTypes__titresStatuts', titresTypes_titresStatuts),
    insert('titresTypes__demarchesTypes', titresTypes__demarchesTypes),
    insert(
      'titresTypes__demarchesTypes__etapesTypes',
      titresTypes_demarchesTypes_etapesTypes
    ),
    insert(
      'titresTypes__demarchesTypes__etapesTypes__documentsTypes',
      titresTypes_demarchesTypes_etapesTypes_documentsTypes
    ),
    insert('etapesTypes__documentsTypes', etapesTypes_documentsTypes),
    insert('entreprises__documents_types', entreprises_documentsTypes),
    insert('etapesTypes__justificatifsTypes', etapesTypes_justificatifsTypes)
  ])
}))

module.exports = seed

module.exports.seed = seed
