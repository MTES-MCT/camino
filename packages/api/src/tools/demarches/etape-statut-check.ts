import { titresEtapesGet } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { isTDEExist } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index.js'

export const etapeStatutCheck = async () => {
  console.info()
  console.info('- - -')
  console.info('vérification des statuts des étapes en bdd')
  console.info()

  const etapes = await titresEtapesGet(
    {},
    {
      fields: {
        type: { id: {} },
        demarche: { titre: { id: {} } },
      },
    },
    userSuper
  )

  let errorsNb = 0

  etapes.forEach(etape => {
    const tdeExists = isTDEExist(etape.demarche!.titre!.typeId, etape.demarche!.typeId, etape.typeId)
    const etapesStatuts = getEtapesStatuts(etape.typeId)

    if (tdeExists && !etapesStatuts!.map(es => es.id).includes(etape.statutId)) {
      console.info(`erreur sur le titre https://camino.beta.gouv.fr/titres/${etape.demarche!.titreId}, étape « ${etape.type!.nom} » a un statut inconnu`)
      errorsNb++
    }
  })
  console.info(`erreurs : ${errorsNb} statuts inconnus`)
}
