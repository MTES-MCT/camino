
import { Context } from '../../../types'



import { User, UtilisateurId } from 'camino-common/src/roles'
import { newUtilisateurId } from '../../../database/models/_format/id-create'
import { getUtilisateurById } from '../../../database/queries/utilisateurs.queries'
import { Pool } from 'pg'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { userSuper } from '../../../database/user-super'

export const userIdGenerate = async (pool: Pool): Promise<UtilisateurId> => {
  const id = newUtilisateurId()
  const utilisateurWithTheSameId = await getUtilisateurById(pool, id, userSuper)
  if (isNotNullNorUndefined(utilisateurWithTheSameId)) {
    return userIdGenerate(pool)
  }

  return id
}

export const utilisateur = async ({ id }: { id: UtilisateurId }, { user, pool }: Context ): Promise<User> => {
  try {
    return await getUtilisateurById(pool, id, user)
  } catch (e) {
    console.error(e)

    throw e
  }
}
