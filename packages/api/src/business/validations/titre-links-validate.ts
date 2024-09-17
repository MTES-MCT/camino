import { TitreId } from 'camino-common/src/validators/titres'
import { ITitre, ITitreDemarche } from '../../types'
import { getLinkConfig } from 'camino-common/src/permissions/titres'
import { NonEmptyArray, isNonEmptyArray, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'

const linkImpossible = 'ce titre ne peut pas être lié à d’autres titres' as const
const oneLinkTitre = 'ce titre peut avoir un seul titre lié' as const
const droitsInsuffisants = 'droits insuffisants ou titre inexistant' as const
export type CheckTitreLinksError = typeof linkImpossible | typeof oneLinkTitre | typeof droitsInsuffisants | 'lien incompatible entre ces types de titre'
export const checkTitreLinks = (
  titreTypeId: TitreTypeId,
  titreFromIds: Readonly<TitreId[]>,
  titresFrom: ITitre[],
  demarches: ITitreDemarche[]
): { valid: true } | { valid: false; errors: NonEmptyArray<CheckTitreLinksError> } => {
  const linkConfig = getLinkConfig(
    titreTypeId,
    demarches.map(({ typeId }) => ({ demarche_type_id: typeId }))
  )
  const errors: CheckTitreLinksError[] = []
  if (isNullOrUndefined(linkConfig)) {
    errors.push(linkImpossible)
  } else {
    if (linkConfig.count === 'single' && titreFromIds.length > 1) {
      errors.push(oneLinkTitre)
    }

    if (titresFrom.length !== titreFromIds.length) {
      errors.push(droitsInsuffisants)
    }

    if (titresFrom.some(({ typeId }) => typeId !== linkConfig.typeId)) {
      errors.push('lien incompatible entre ces types de titre')
    }
  }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}
