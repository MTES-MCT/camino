import { ITitrePoint, ITitrePointReference } from '../../types'

import {
  titrePointReferenceCreate,
  titresPointsGet
} from '../../database/queries/titres-points'

const titreEtapePointsReferencesNewFind = (titrePoints: ITitrePoint[]) =>
  titrePoints.reduce((acc: ITitrePointReference[], titrePoint) => {
    if (!titrePoint.references || titrePoint.references.length === 0) {
      acc.push({
        id: `${titrePoint.id}-4326`,
        titrePointId: titrePoint.id,
        geoSystemeId: '4326',
        coordonnees: {
          x: titrePoint.coordonnees.x,
          y: titrePoint.coordonnees.y
        }
      })
    }

    return acc
  }, [])

export const titresPointsReferencesCreate = async () => {
  console.info()
  console.info('références des points…')

  const titresPoints = await titresPointsGet()

  const pointsReferencesNew = titreEtapePointsReferencesNewFind(titresPoints)
  const pointsReferencesCreated = [] as string[]

  for (const r of pointsReferencesNew) {
    await titrePointReferenceCreate(r)
    console.info(
      'titre / démarche / étape / point / référence (création) ->',
      JSON.stringify(r.id)
    )

    pointsReferencesCreated.push(r.id)
  }

  return pointsReferencesCreated
}
