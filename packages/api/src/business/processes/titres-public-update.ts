import { titresGet, titreUpdate } from '../../database/queries/titres'
import { userSuper } from '../../database/user-super'
import titrePublicFind from '../rules/titre-public-find'

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
        type: { titresTypesTitresStatuts: { id: {} } },
        demarches: { id: {} }
      }
    },
    userSuper
  )

  // TODO: forcer la présence des démarches sur le titre
  // https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist/49725198#49725198
  const titresUpdated = [] as string[]

  for (const titre of titres) {
    const { publicLecture, entreprisesLecture } = titrePublicFind(
      titre.titreStatutId!,
      titre.type!.titresTypesTitresStatuts!,
      titre.demarches || []
    )

    const patch = {} as ITitrePatch

    if (titre.publicLecture !== publicLecture) {
      patch.publicLecture = publicLecture
    }

    if (titre.entreprisesLecture !== entreprisesLecture) {
      patch.entreprisesLecture = entreprisesLecture
    }

    if (Object.keys(patch).length) {
      await titreUpdate(titre.id, patch)

      console.info(
        'titre : public (mise à jour) ->',
        `${titre.id} : ${JSON.stringify(patch)}`
      )

      titresUpdated.push(titre.id)
    }
  }

  return titresUpdated
}
