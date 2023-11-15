import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { titresGet, titreUpdate } from '../../database/queries/titres.js'
import { userSuper } from '../../database/user-super.js'
import { titreCoordonneesFind } from '../utils/titre-coordonnees-find.js'

export const titresCoordonneesUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('coordonnées des titres…')

  const titres = await titresGet({ ids: titresIds }, { fields: { points: { id: {} } } }, userSuper)

  const titresCoordonneesUpdated: string[] = []

  for (const titre of titres) {
    const coordonnees = titreCoordonneesFind(titre.points)

    if (isTitreCoordonneesToUpdate(titre.coordonnees, coordonnees)) {
      await titreUpdate(titre.id, { coordonnees })

      console.info('titre : coordonnées (mise à jour) ->', `${titre.id} : ${coordonnees?.x}, ${coordonnees?.y}`)

      titresCoordonneesUpdated.push(titre.id)
    }
  }

  return titresCoordonneesUpdated
}

type Coordonnees = { x?: number | null; y?: number | null } | null
// VISIBLE FOR TESTING
export const isTitreCoordonneesToUpdate = (currentCoordonnees: Coordonnees | undefined, newCoordonnees: Coordonnees): boolean => {
  return (
    (isNotNullNorUndefined(newCoordonnees) && isNotNullNorUndefined(currentCoordonnees) && (newCoordonnees.x !== currentCoordonnees.x || newCoordonnees.y !== currentCoordonnees.y)) ||
    !newCoordonnees !== !currentCoordonnees
  )
}
