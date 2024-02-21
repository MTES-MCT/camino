import { titrePublicFind } from 'camino-common/src/static/titresTypes_titresStatuts.js'
import { TitreId } from 'camino-common/src/validators/titres.js'
import { getTitrePublicUpdateData, updateTitrePublicLecture } from './titres-public-update.queries.js'
import { Pool } from 'pg'
import { NonEmptyArray } from 'camino-common/src/typescript-tools.js'

// met à jour la publicité d'un titre
export const titresPublicUpdate = async (pool: Pool, titresIds?: NonEmptyArray<TitreId>) => {
  console.info()
  console.info('publicité des titres…')

  const titres = await getTitrePublicUpdateData(pool, titresIds ?? null)

  const titresUpdated: TitreId[] = []

  for (const titre of titres) {
    const publicLecture = titrePublicFind(titre.titre_statut_id, titre.titre_type_id, titre.has_demarche_public)

    if (titre.public_lecture !== publicLecture) {
      await updateTitrePublicLecture(pool, titre.id, publicLecture)

      console.info('titre : public (mise à jour) ->', `${titre.id} : ${publicLecture}}`)

      titresUpdated.push(titre.id)
    }
  }

  return titresUpdated
}
