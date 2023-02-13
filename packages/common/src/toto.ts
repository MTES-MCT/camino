import { readFile } from 'fs'
import { AdministrationId, ADMINISTRATION_IDS } from './static/administrations.js'
import { TitresStatutIds } from './static/titresStatuts.js'
import { ETAPES_TYPES, EtapeTypeId } from './static/etapesTypes.js'
import { TitresTypes, TitresTypesIds, TITRES_TYPES_IDS, TitreTypeId } from './static/titresTypes.js'
import { DEMARCHES_TYPES_IDS } from './static/demarchesTypes.js'

const autorisationDOuvertureDeTravauxCommun = [
  "ETAPES_TYPES['depotDeLaDemande_wdd']",
  "ETAPES_TYPES['demandeDeComplements_AOTMOuDOTM_']",
  "ETAPES_TYPES['receptionDeComplements_wrc']",
  "ETAPES_TYPES['avisDeReception']",
  "ETAPES_TYPES['avisDunServiceAdministratifLocal_wal']",
  "ETAPES_TYPES['avisDeLaDirectionDepartementaleDesTerritoiresEtDeLaMerDDT_M_']",
  "ETAPES_TYPES['avisDeLautoriteMilitaire_wam']",
  "ETAPES_TYPES['avisDeLagenceRegionaleDeSanteARS']",
  "ETAPES_TYPES['avisDeDirectionRegionaleDesAffairesCulturellesDRAC']",
  "ETAPES_TYPES['avisDuPrefetMaritime_wap']",
  "ETAPES_TYPES['avisDesAutresInstances']",
  "ETAPES_TYPES['avisDuDemandeurSurLesPrescriptionsProposees']",
  "ETAPES_TYPES['donneActeDeLaDeclaration_DOTM_']",
  "ETAPES_TYPES['abandonDeLaDemande']",
  "ETAPES_TYPES['declarationDouvertureDeTravauxMiniers_DOTM_']",
  "ETAPES_TYPES['recevabilite']",
  "ETAPES_TYPES['saisineDesServicesDeLEtat']",
  "ETAPES_TYPES['rapportDeLaDreal']",
  "ETAPES_TYPES['transmissionDuProjetDePrescriptionsAuDemandeur']"
] as const

const travaux = ['AutorisationDOuvertureDeTravaux', 'DeclarationDOuvertureDeTravaux', 'DeclarationDArretDefinitifDesTravaux']

readFile('/opt/clients/camino/camino/packages/api/sources/titres-types--demarches-types--etapes-types.json', 'utf8', (err, data) => {
  if (err) {
    console.log(`Error reading file from disk: ${err}`)
  } else {
    // parse JSON string to JSON object
    const databases: any[] = JSON.parse(data)

    const result: {
      [key in string]?: { [key in string]?: string[] }
    } = {}

    databases.sort((a, b) => a.ordre - b.ordre)
    // print all databases
    databases.map((db: any) => {
      const demarcheTypeKey = Object.entries(DEMARCHES_TYPES_IDS).find(([key, value]) => value === db.demarche_type_id) ?? ['not found']

      const titreTypeKey = Object.entries(TITRES_TYPES_IDS).find(([key, value]) => value === db.titre_type_id) ?? ['not found']
      const etapeTypeKey = Object.entries(ETAPES_TYPES).find(([key, value]) => value === db.etape_type_id) ?? ['not found']

      if (titreTypeKey[0] === 'not found' || demarcheTypeKey[0] === 'not found' || etapeTypeKey[0] === 'not found') {
        // console.log(`raaaaaha ${JSON.stringify(db)}`)
      } else {
        if (travaux.includes(demarcheTypeKey[0])) {
        } else {
          if (!result[`[TITRES_TYPES_IDS['${titreTypeKey[0]}']]`]?.[`[DEMARCHES_TYPES_IDS['${demarcheTypeKey[0]}']]`]) {
            ;(result[`[TITRES_TYPES_IDS['${titreTypeKey[0]}']]`] ??= {})[`[DEMARCHES_TYPES_IDS['${demarcheTypeKey[0]}']]`] = []
          }

          ;(result[`[TITRES_TYPES_IDS['${titreTypeKey[0]}']]`] ??= {})[`[DEMARCHES_TYPES_IDS['${demarcheTypeKey[0]}']]`]?.push(`ETAPES_TYPES['${etapeTypeKey[0]}']`)
        }
      }
    })

    Object.keys(result).forEach(titreId => {

      Object.keys(result[titreId]).forEach(demarcheId => {
        if (result[titreId][demarcheId]?.length === 1) {
          console.log(titreId)
        }
      })
        // // result[titreId]["...travaux"] = {}
        // // console.log(result[titreId])
        // if (!result[titreId]["[DEMARCHES_TYPES_IDS['DeclarationDOuvertureDeTravaux']]"]) {
        //     console.log('pas trouvé pour ' + titreId)
        // }
        // // console.log(result[titreId]["[DEMARCHES_TYPES_IDS['DeclarationDOuvertureDeTravaux']]"])
        // if (!result[titreId]["[DEMARCHES_TYPES_IDS['DeclarationDOuvertureDeTravaux']]"]?.every(etapeTypeId => autorisationDOuvertureDeTravauxCommun.includes(etapeTypeId))) {
        //     console.log('des étapes en trop' + titreId)
        // }

        // if (!autorisationDOuvertureDeTravauxCommun.every(etapeTypeId => result[titreId]["[DEMARCHES_TYPES_IDS['DeclarationDOuvertureDeTravaux']]"].includes(etapeTypeId))) {
        //     console.log('des étapes en pas assez' + titreId)
        // }
    })

    // console.log(JSON.stringify(result))
  }
})
