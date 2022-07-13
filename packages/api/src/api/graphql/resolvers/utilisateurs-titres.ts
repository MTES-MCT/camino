import { debug } from '../../../config/index'

import {
  utilisateurTitreCreate,
  utilisateurTitreDelete
} from '../../../database/queries/utilisateurs'

import { titreGet } from '../../../database/queries/titres'
import { Context } from '../../../types'

const utilisateurTitreAbonner = async (
  { titreId, abonner }: { titreId: string; abonner: boolean },
  { user }: Context
) => {
  try {
    if (!user) {
      throw new Error('droits insuffisants')
    }

    const titre = await titreGet(titreId, { fields: { id: {} } }, user)

    if (!titre) {
      throw new Error('droits insuffisants')
    }

    if (abonner) {
      await utilisateurTitreCreate({ utilisateurId: user.id, titreId })
    } else {
      await utilisateurTitreDelete(user.id, titreId)
    }

    return true
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

export { utilisateurTitreAbonner }
