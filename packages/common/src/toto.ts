import { readFile } from 'fs'
import { AdministrationId, ADMINISTRATION_IDS } from './static/administrations.js'
import { TitresStatutIds } from './static/titresStatuts.js'
import { ETAPES_TYPES, EtapeTypeId } from './static/etapesTypes.js'
import { TitresTypes, TitresTypesIds, TITRES_TYPES_IDS, TitreTypeId } from './static/titresTypes.js'
import { DEMARCHES_TYPES_IDS } from './static/demarchesTypes.js'

// readFile('/opt/clients/camino/camino/packages/api/sources/administrations--titres-types--titres-statuts.json', 'utf8', (err, data) => {
//   if (err) {
//     console.log(`Error reading file from disk: ${err}`)
//   } else {
//     // parse JSON string to JSON object
//     const databases = JSON.parse(data)

//     // print all databases
//     const values = databases.map(db => {
//       const administrationKey = Object.entries(ADMINISTRATION_IDS).find(([key, value]) => value === db.administration_id) ?? [ 'not found']
//       const titreStatutKey = Object.entries(TitresStatutIds).find(([key, value]) => value === db.titre_statut_id) ?? ['not found']
//       return {
//         administrationId: `ADMINISTRATION_IDS['${administrationKey[0]}']`,
//         titreTypeId: db.titre_type_id,
//         titreStatutId: `TitresStatutIds.${titreStatutKey[0]}`,
//         titresModificationInterdit: db.titres_modification_interdit,
//         demarchesModificationInterdit: db.demarches_modification_interdit,
//         etapesModificationInterdit: db.etapes_modification_interdit,
//       }
//   })

//     console.log(values)
//   }
// })

const plop = [
  DEMARCHES_TYPES_IDS.AutorisationDOuvertureDeTravaux,
  DEMARCHES_TYPES_IDS.DeclarationDArretDefinitifDesTravaux,
  DEMARCHES_TYPES_IDS.DeclarationDOuvertureDeTravaux,
  DEMARCHES_TYPES_IDS.Octroi,
  DEMARCHES_TYPES_IDS.Renonciation,
  DEMARCHES_TYPES_IDS.Retrait
]
readFile('/opt/clients/camino/camino/packages/api/sources/titres-types--demarches-types.json', 'utf8', (err, data) => {
  if (err) {
    console.log(`Error reading file from disk: ${err}`)
  } else {
    // parse JSON string to JSON object
    const databases: any[] = JSON.parse(data)

    const result: {
      [key in string]?: string[]
    } = {}

    databases.sort((a, b) => a.ordre - b.ordre)
    // print all databases
    databases.map((db: any) => {
      const demarcheTypeKey = Object.entries(DEMARCHES_TYPES_IDS).find(([key, value]) => value === db.demarche_type_id) ?? ['not found']

      const titreTypeKey = Object.entries(TITRES_TYPES_IDS).find(([key, value]) => value === db.titre_type_id) ?? ['not found']

      if (titreTypeKey[0] === 'not found') {
        // console.log("bite", db)
      } else {
        if (!result[`[TITRES_TYPES_IDS['${titreTypeKey[0]}']]`]) {
          result[`[TITRES_TYPES_IDS['${titreTypeKey[0]}']]`] = ['...demarchesEverywhere']
        }

        if (!plop.includes(demarcheTypeKey[1])) {
          result[`[TITRES_TYPES_IDS['${titreTypeKey[0]}']]`]?.push(`DEMARCHES_TYPES_IDS['${demarcheTypeKey[0]}']`)
        }
      }
    })

    console.log(JSON.stringify(result))
  }
})
