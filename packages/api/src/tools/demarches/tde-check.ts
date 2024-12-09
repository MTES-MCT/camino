import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { isTDEExist } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index'
import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { CaminoMachineId, machineIdFind } from 'camino-common/src/machines'
import { demarcheEnregistrementDemandeDateFind } from 'camino-common/src/demarche'

export const titreTypeDemarcheTypeEtapeTypeCheck = async (): Promise<number> => {
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
    const firstEtapeDate = demarcheEnregistrementDemandeDateFind(d.etapes)
    let machineId: CaminoMachineId | undefined
    if (isNotNullNorUndefined(firstEtapeDate)) {
      machineId = machineIdFind(d.titre!.typeId, d.typeId, d.id, firstEtapeDate)
    }

    if (isNullOrUndefined(machineId)) {
      d.etapes?.forEach(({ typeId }) => {
        if (!isTDEExist(d.titre!.typeId, d.typeId, typeId)) {
          console.info(`erreur sur le titre https://camino.beta.gouv.fr/titres/${d.titre!.id}, TDE inconnu ${d.titre!.typeId} ${d.typeId} ${typeId} (${EtapesTypes[typeId].nom})`)
          errorsNb++
        }
      })
    }
  })
  console.info(`erreurs : ${errorsNb} TDE inconnus`)
  return errorsNb
}
