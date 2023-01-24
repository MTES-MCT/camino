import { readFile } from 'fs'
import { ADMINISTRATION_IDS } from './static/administrations.js'
// import { TitresStatutIds } from './static/titresStatuts.js'
import { ETAPES_TYPES } from './static/etapesTypes.js'

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

readFile('/opt/clients/camino/camino/packages/api/sources/administrations--titres-types--etapes-types.json', 'utf8', (err, data) => {
  if (err) {
    console.log(`Error reading file from disk: ${err}`)
  } else {
    // parse JSON string to JSON object
    const databases = JSON.parse(data)

    // print all databases
    const values = databases.map((db: any) => {
      const administrationKey = Object.entries(ADMINISTRATION_IDS).find(([_key, value]) => value === db.administration_id) ?? ['not found']
      const etapeTypeIdKey = Object.entries(ETAPES_TYPES).find(([_key, value]) => value === db.etape_type_id) ?? ['not found']
      // {
      //   "administration_id": "aut-97300-01",
      //   "titre_type_id": "arm",
      //   "etape_type_id": "aof",
      //   "lecture_interdit": true,
      //   "creation_interdit": true,
      //   "modification_interdit": true
      // },
      
      return {
        administrationId: `ADMINISTRATION_IDS['${administrationKey[0]}']`,
        titreTypeId: db.titre_type_id,
        etapeTypeId: `ETAPES_TYPES.${etapeTypeIdKey[0]}`,
        lectureInterdit: db.lecture_interdit ?? false,
        creationInterdit: db.creation_interdit ?? false,
        modificationInterdit: db.modification_interdit ?? false
      }
    })

    console.log(JSON.stringify(values))
  }
})
