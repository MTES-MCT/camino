import { ITitreEtape, IUtilisateur } from '../../types.js'

import { titreEtapeUpdate } from '../../database/queries/titres-etapes.js'
import { titresDemarchesGet } from '../../database/queries/titres-demarches.js'
import {
  etapeSectionsDictionaryBuild,
  titreEtapeHeritageContenuFind
} from '../utils/titre-etape-heritage-contenu-find.js'
import { userSuper } from '../../database/user-super.js'
import {
  titreEtapesSortAscByOrdre,
  titreEtapesSortDescByOrdre
} from '../utils/titre-etapes-sort.js'

export const titresEtapesHeritageContenuUpdate = async (
  user: IUtilisateur,
  titresDemarchesIds?: string[]
) => {
  console.info()
  console.info('héritage des contenus des étapes…')

  const titresDemarches = await titresDemarchesGet(
    { titresDemarchesIds },
    {
      fields: {
        etapes: { type: { id: {} } }
      }
    },
    userSuper
  )

  // lorsqu'une étape est mise à jour par un utilisateur,
  // l'objet heritageContenu reçu ne contient pas d'id d'étape
  // l'étape est donc toujours mise à jour

  const titresEtapesIdsUpdated = [] as string[]

  for (const titreDemarche of titresDemarches) {
    if (titreDemarche.etapes?.length) {
      const etapeSectionsDictionary = etapeSectionsDictionaryBuild(
        titreDemarche.etapes
      )
      const titreEtapes = titreEtapesSortAscByOrdre(
        titreDemarche.etapes?.filter(e => etapeSectionsDictionary[e.id]) ?? []
      )

      if (titreEtapes) {
        for (let index = 0; index < titreEtapes.length; index++) {
          const titreEtape: ITitreEtape = titreEtapes[index]
          const titreEtapesFiltered = titreEtapesSortDescByOrdre(
            titreEtapes.slice(0, index)
          )

          const { contenu, heritageContenu, hasChanged } =
            titreEtapeHeritageContenuFind(
              titreEtapesFiltered,
              titreEtape,
              etapeSectionsDictionary
            )

          if (hasChanged) {
            await titreEtapeUpdate(
              titreEtape.id,
              {
                contenu,
                heritageContenu
              },
              user,
              titreDemarche.titreId
            )

            console.info(
              'titre / démarche / étape : héritage du contenu (mise à jour) ->',
              titreEtape.id
            )

            titresEtapesIdsUpdated.push(titreEtape.id)

            titreEtape.contenu = contenu
            titreEtape.heritageContenu = heritageContenu
          }
        }
      }
    }
  }

  return titresEtapesIdsUpdated
}
