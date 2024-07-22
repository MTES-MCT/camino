import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'
import { ITitreDemarche } from '../../types.js'

export const titreDemarcheUpdationValidate = async (titreDemarcheNew: ITitreDemarche, titreDemarcheOld: ITitreDemarche) => {
  const errors = [] as string[]

  if (titreDemarcheNew.typeId !== titreDemarcheOld.typeId && isNotNullNorUndefinedNorEmpty(titreDemarcheOld.etapes)) {
    errors.push('impossible de modifier le type d’une démarche si celle-ci a déjà une ou plusieurs étapes')
  }

  return errors
}
