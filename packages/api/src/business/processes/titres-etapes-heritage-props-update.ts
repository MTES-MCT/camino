import { ITitreEtape, IUtilisateur } from '../../types'

import { titreEtapeUpsert } from '../../database/queries/titres-etapes'
import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { titreEtapeHeritagePropsFind } from '../utils/titre-etape-heritage-props-find'
import { userSuper } from '../../database/user-super'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort'

export const titresEtapesHeritagePropsUpdate = async (
  user: IUtilisateur,
  titresDemarchesIds?: string[]
) => {
  console.info()
  console.info('héritage des propriétés des étapes…')

  const titresDemarches = await titresDemarchesGet(
    { titresDemarchesIds },
    {
      fields: {
        etapes: {
          type: { id: {} },
          titulaires: { id: {} },
          amodiataires: { id: {} },
          substances: { id: {} },
          points: { references: { id: {} } }
        }
      }
    },
    userSuper
  )

  // lorsqu'une étape est mise à jour par un utilisateur,
  // l'objet heritageProps reçu ne contient pas d'id d'étape
  // l'étape est donc toujours mise à jour

  const titresEtapesIdsUpdated = [] as string[]

  for (const titreDemarche of titresDemarches) {
    const titreEtapes = titreEtapesSortAscByOrdre(
      titreDemarche.etapes?.filter(e => e.type!.fondamentale) ?? []
    )

    for (let index = 0; index < titreEtapes.length; index++) {
      const titreEtape: ITitreEtape = titreEtapes[index]
      const titreEtapePrecedente = index > 0 ? titreEtapes[index - 1] : null

      const { hasChanged, titreEtape: newTitreEtape } =
        titreEtapeHeritagePropsFind(titreEtape, titreEtapePrecedente)

      if (hasChanged) {
        await titreEtapeUpsert(newTitreEtape, user, titreDemarche.titreId)

        console.info(
          'titre / démarche / étape : héritage des propriétés (mise à jour) ->',
          titreEtape.id
        )

        titresEtapesIdsUpdated.push(titreEtape.id)

        // met à jour l'étape pour l'itération suivante
        titreEtapes[index] = newTitreEtape
      }
    }
  }

  return titresEtapesIdsUpdated
}
