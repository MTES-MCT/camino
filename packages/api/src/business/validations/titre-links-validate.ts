import { TitreId } from 'camino-common/src/validators/titres'
import { ITitre, ITitreDemarche } from '../../types'
import { getLinkConfig } from 'camino-common/src/permissions/titres'
import { NonEmptyArray, isNonEmptyArray, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'

export const checkTitreLinks = (titreTypeId: TitreTypeId, titreFromIds: Readonly<TitreId[]>, titresFrom: ITitre[], demarches: ITitreDemarche[]): { valid: true } | { valid: false; errors: NonEmptyArray<string> } => {
  const linkConfig = getLinkConfig(
    titreTypeId,
    demarches.map(({ typeId }) => ({ demarche_type_id: typeId }))
  )
  const errors = []
  if (isNullOrUndefined(linkConfig)) {
    errors.push('ce titre ne peut pas être lié à d’autres titres')
  } else {
    if (linkConfig.count === 'single' && titreFromIds.length > 1) {
      errors.push('ce titre peut avoir un seul titre lié')
    }

    if (titresFrom.length !== titreFromIds.length) {
      errors.push('droits insuffisants ou titre inexistant')
    }

    if (titresFrom.some(({ typeId }) => typeId !== linkConfig.typeId)) {
      errors.push(`un titre de type ${titreTypeId} ne peut-être lié qu’à un titre de type ${linkConfig.typeId}`)
    }

  }

  if (isNonEmptyArray(errors)) {
    return {valid: false, errors}
  }

  return {valid: true}


}
