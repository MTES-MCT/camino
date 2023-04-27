import { EtapesTypes } from 'camino-common/src/static/etapesTypes.js'
import { isTDEExist } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index.js'
import { demarcheDefinitionFind, isDemarcheDefinitionMachine } from '../../business/rules-demarches/definitions.js'
import { titresDemarchesGet } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'

export const titreTypeDemarcheTypeEtapeTypeCheck = async () => {
  console.info()
  console.info('- - -')
  console.info('vérification de TDE avec les démarches en bdd')
  console.info()

  const demarches = await titresDemarchesGet(
    {},
    {
      fields: {
        titre: { id: {} },
        etapes: { id: {} },
      },
    },
    userSuper
  )

  let errorsNb = 0

  demarches.forEach(d => {
    const demarcheDefinition = demarcheDefinitionFind(d.titre!.typeId, d.typeId, d.etapes, d.id)

    if (!isDemarcheDefinitionMachine(demarcheDefinition)) {
      d.etapes?.forEach(({ typeId }) => {
        if (!isTDEExist(d.titre!.typeId, d.typeId, typeId)) {
          console.info(`erreur sur le titre https://camino.beta.gouv.fr/titres/${d.titre!.id}, TDE inconnu ${d.titre!.typeId} ${d.typeId} ${typeId} (${EtapesTypes[typeId].nom})`)
          errorsNb++
        }
      })
    }
  })
  console.info(`erreurs : ${errorsNb} TDE inconnus`)
}
