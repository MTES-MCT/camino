import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { isTDEExist } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index'
import { machineFind } from '../../business/rules-demarches/definitions'
import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'

export const titreTypeDemarcheTypeEtapeTypeCheck = async (): Promise<void> => {
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
    const machine = machineFind(d.titre!.typeId, d.typeId, d.etapes, d.id)

    if (isNullOrUndefined(machine)) {
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
