import seeding from '../seeding.js'
/* eslint-disable camelcase */

import domaines from '../../../sources/domaines.json' assert { type: 'json' }
import titresTypesTypes from '../../../sources/titres-types-types.json' assert { type: 'json' }
import titresTypes from '../../../sources/titres-types.json' assert { type: 'json' }
import demarchesTypes from '../../../sources/demarches-types.json' assert { type: 'json' }
import titresTypes__demarchesTypes from '../../../sources/titres-types--demarches-types.json' assert { type: 'json' }
import etapesTypes from '../../../sources/etapes-types.json' assert { type: 'json' }
import titresTypes_demarchesTypes_etapesTypes from '../../../sources/titres-types--demarches-types--etapes-types.json' assert { type: 'json' }
import etapesTypes_justificatifsTypes from '../../../sources/etapes-types--justificatifs-types.json' assert { type: 'json' }
import entreprises_documentsTypes from '../../../sources/entreprises--documents-types.json' assert { type: 'json' }
import documentsTypes from '../../../sources/documents-types.json' assert { type: 'json' }

export const seed = seeding(async ({ insert }) => {
  await Promise.all([
    insert('domaines', domaines),
    insert('titresTypesTypes', titresTypesTypes),
    insert('demarchesTypes', demarchesTypes),
    insert('etapesTypes', etapesTypes),
    insert('documentsTypes', documentsTypes)
  ])
  await Promise.all([insert('titresTypes', titresTypes)])
  await Promise.all([
    insert('titresTypes__demarchesTypes', titresTypes__demarchesTypes),
    insert(
      'titresTypes__demarchesTypes__etapesTypes',
      titresTypes_demarchesTypes_etapesTypes
    ),
    insert('entreprises__documents_types', entreprises_documentsTypes),
    insert('etapesTypes__justificatifsTypes', etapesTypes_justificatifsTypes)
  ])
})
