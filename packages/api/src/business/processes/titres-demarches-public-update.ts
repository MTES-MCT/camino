import { titreDemarcheUpdate } from '../../database/queries/titres-demarches.js'
import { titreDemarchePublicFind } from '../rules/titre-demarche-public-find.js'
import { titresGet } from '../../database/queries/titres.js'
import { userSuper } from '../../database/user-super.js'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort.js'

type ITitreDemarchePatch = {
  publicLecture: boolean
  entreprisesLecture: boolean
}

// met à jour la publicité des démarches d'un titre
export const titresDemarchesPublicUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('publicité des démarches…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: {
          type: { etapesTypes: { id: {} } },
          etapes: { id: {} }
        }
      }
    },
    userSuper
  )

  // TODO: forcer la présence des démarches sur le titre
  // https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist/49725198#49725198

  const titresDemarchesUpdated: string[] = []

  for (const titre of titres) {
    for (const titreDemarche of titre.demarches!) {
      const titreDemarcheEtapes = titreEtapesSortAscByOrdre(
        titreDemarche.etapes ?? []
      )

      const demarcheTypeEtapesTypes = titreDemarche.type!.etapesTypes!.filter(
        et => et.titreTypeId === titre.typeId
      )

      const { publicLecture, entreprisesLecture } = titreDemarchePublicFind(
        titreDemarche.typeId,
        demarcheTypeEtapesTypes,
        titreDemarcheEtapes,
        titre.id,
        titre.demarches,
        titre.typeId
      )

      const patch = {} as ITitreDemarchePatch

      if (titreDemarche.publicLecture !== publicLecture) {
        patch.publicLecture = publicLecture
      }

      if (titreDemarche.entreprisesLecture !== entreprisesLecture) {
        patch.entreprisesLecture = entreprisesLecture
      }

      if (Object.keys(patch).length) {
        await titreDemarcheUpdate(titreDemarche.id, patch)

        console.info(
          'titre / démarche : publique (mise à jour) ->',
          `${titreDemarche.id}: ${JSON.stringify(patch)}`
        )

        titresDemarchesUpdated.push(titreDemarche.id)
      }
    }
  }

  return titresDemarchesUpdated
}
