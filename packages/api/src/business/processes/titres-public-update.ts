import { titrePublicFind } from 'camino-common/src/static/titresTypes_titresStatuts.js'
import { titresGet, titreUpdate } from '../../database/queries/titres.js'
import { userSuper } from '../../database/user-super.js'

type ITitrePatch = {
  publicLecture: boolean
  entreprisesLecture: boolean
}

// met à jour la publicité d'un titre
export const titresPublicUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('publicité des titres…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: { id: {} },
      },
    },
    userSuper
  )

  // TODO: forcer la présence des démarches sur le titre
  // https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist/49725198#49725198
  const titresUpdated = [] as string[]

  for (const titre of titres) {
    const publicLecture = titrePublicFind(titre.titreStatutId, titre.typeId, titre.demarches || [])

    const patch = {} as ITitrePatch

    if (titre.publicLecture !== publicLecture) {
      patch.publicLecture = publicLecture
    }

    // TODO 2023-11-08 trouver le courage d'aller jusqu'à la BDD supprimer ce champ qui est toujours à true
    if (titre.entreprisesLecture !== true) {
      patch.entreprisesLecture = true
    }

    if (Object.keys(patch).length) {
      await titreUpdate(titre.id, patch)

      console.info('titre : public (mise à jour) ->', `${titre.id} : ${JSON.stringify(patch)}`)

      titresUpdated.push(titre.id)
    }
  }

  return titresUpdated
}
