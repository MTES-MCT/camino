import { ITitre, ITitreDemarche } from '../../types'
import { getLinkConfig } from 'camino-common/src/permissions/titres'

export const checkTitreLinks = (
  titre: Pick<ITitre, 'typeId'>,
  titreFromIds: string[],
  titresFrom: ITitre[],
  demarches: ITitreDemarche[]
) => {
  const linkConfig = getLinkConfig(titre.typeId, demarches)
  if (!linkConfig) {
    throw new Error('ce titre ne peut pas être lié à d’autres titres')
  }

  if (linkConfig.count === 'single' && titreFromIds.length > 1) {
    throw new Error('ce titre peut avoir un seul titre lié')
  }

  if (titresFrom.length !== titreFromIds.length) {
    throw new Error('droit insuffisant')
  }

  if (linkConfig) {
    if (titresFrom.some(({ typeId }) => typeId !== linkConfig.typeId)) {
      throw new Error(
        `un titre de type ${titre.typeId} ne peut-être lié qu’à un titre de type ${linkConfig.typeId}`
      )
    }
  }
}
