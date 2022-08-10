import { titresGet, titreUpdate } from '../../database/queries/titres'
import { userSuper } from '../../database/user-super'
import { titreCoordonneesFind } from '../utils/titre-coordonnees-find'

export const titresCoordonneesUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('coordonnées des titres…')

  const titres = await titresGet(
    { ids: titresIds },
    { fields: { points: { id: {} } } },
    userSuper
  )

  const titresCoordonneesUpdated = [] as string[]

  for (const titre of titres) {
    const coordonnees = titreCoordonneesFind(titre.points)

    if (
      (coordonnees &&
        titre.coordonnees &&
        (coordonnees.x !== titre.coordonnees.x ||
          coordonnees.y !== titre.coordonnees.y)) ||
      !coordonnees !== !titre.coordonnees
    ) {
      await titreUpdate(titre.id, { coordonnees })

      console.info(
        'titre : coordonnées (mise à jour) ->',
        `${titre.id} : ${coordonnees?.x}, ${coordonnees?.y}`
      )

      titresCoordonneesUpdated.push(titre.id)
    }
  }

  return titresCoordonneesUpdated
}
