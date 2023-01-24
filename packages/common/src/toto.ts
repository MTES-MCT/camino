import { readFile } from 'fs'
import { AdministrationId, ADMINISTRATION_IDS } from './static/administrations.js'
import { TitresStatutIds } from './static/titresStatuts.js'
import { ETAPES_TYPES, EtapeTypeId } from './static/etapesTypes.js'
import { TitreTypeId } from './static/titresTypes.js'

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

readFile('/Users/bcousin/workspace/camino/camino/packages/api/sources/administrations--titres-types--titres-statuts.json', 'utf8', (err, data) => {
  if (err) {
    console.log(`Error reading file from disk: ${err}`)
  } else {
    // parse JSON string to JSON object
    const databases = JSON.parse(data)

    const result: {
      [key in string]?: {
        [key in string]?: {
          [key in string]?: {
            titresModificationInterdit: boolean
            demarchesModificationInterdit: boolean
            etapesModificationInterdit: boolean
          }
        }
      }
    } = {}
    // print all databases
    databases.map((db: any) => {
      const administrationKey = Object.entries(ADMINISTRATION_IDS).find(([_key, value]) => value === db.administration_id) ?? ['not found']
      const etapeTypeIdKey = Object.entries(ETAPES_TYPES).find(([_key, value]) => value === db.etape_type_id) ?? ['not found']
      const titreStatutKey = Object.entries(TitresStatutIds).find(([key, value]) => value === db.titre_statut_id) ?? ['not found']

      ;((result[`[ADMINISTRATION_IDS['${administrationKey[0]}']]`] ??= {})[db.titre_type_id] ??= {})[`[TitresStatutIds.${titreStatutKey[0]}]`] = {
        titresModificationInterdit: db.titres_modification_interdit ?? false,
        demarchesModificationInterdit: db.demarches_modification_interdit ?? false,
        etapesModificationInterdit: db.etapes_modification_interdit ?? false
      }
    })

    console.log(JSON.stringify(result))
  }
})
