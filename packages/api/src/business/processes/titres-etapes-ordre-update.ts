import { IUtilisateur } from '../../types'

import { titreEtapeUpdate } from '../../database/queries/titres-etapes'
import { titreEtapesSortAscByDate } from '../utils/titre-etapes-sort'
import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'

export const titresEtapesOrdreUpdate = async (
  user: IUtilisateur,
  titresDemarchesIds?: string[]
) => {
  console.info()
  console.info('ordre des étapes…')

  const titresDemarches = await titresDemarchesGet(
    { titresDemarchesIds },
    {
      fields: {
        etapes: { id: {} },
        type: { etapesTypes: { id: {} } },
        titre: { id: {} }
      }
    },
    userSuper
  )

  const titresEtapesIdsUpdated = [] as string[]

  for (const titreDemarche of titresDemarches) {
    if (titreDemarche.etapes) {
      const etapes = titreEtapesSortAscByDate(
        titreDemarche.etapes,
        titreDemarche.type,
        titreDemarche.titre?.typeId
      )
      for (let index = 0; index < etapes.length; index++) {
        const titreEtape = etapes[index]
        if (titreEtape.ordre !== index + 1) {
          await titreEtapeUpdate(
            titreEtape.id,
            { ordre: index + 1 },
            user,
            titreDemarche.titreId
          )

          console.info(
            'titre / démarche / étape : ordre (mise à jour) ->',
            `${titreEtape.id} : ${index + 1}`
          )

          titresEtapesIdsUpdated.push(titreEtape.id)
        }
      }
    }
  }

  return titresEtapesIdsUpdated
}
