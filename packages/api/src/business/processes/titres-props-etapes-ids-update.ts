import { IPropsTitreEtapesIds, propsTitreEtapeIdKeys } from '../../types'

import { titresGet, titreUpdate } from '../../database/queries/titres'
import { titrePropTitreEtapeFind } from '../rules/titre-prop-etape-find'
import { objectsDiffer } from '../../tools/index'
import { userSuper } from '../../database/user-super'

export const titresPropsEtapesIdsUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('propriétés des titres (liens vers les étapes)…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: {
          phase: { id: {} },
          etapes: {
            points: { id: {} },
            titulaires: { id: {} },
            amodiataires: { id: {} }
          }
        }
      }
    },
    userSuper
  )

  const titresPropsEtapesIdsUpdated = [] as string[]

  for (const titre of titres) {
    const propsTitreEtapesIds = propsTitreEtapeIdKeys.reduce(
      (propsTitreEtapesIds: IPropsTitreEtapesIds, propId) => {
        const titreEtape = titrePropTitreEtapeFind(
          propId,
          titre.demarches!,
          titre.titreStatutId!
        )

        if (titreEtape) {
          propsTitreEtapesIds[propId] = titreEtape.id
        }

        return propsTitreEtapesIds
      },
      {}
    )

    if (objectsDiffer(propsTitreEtapesIds, titre.propsTitreEtapesIds)) {
      await titreUpdate(titre.id, { propsTitreEtapesIds })

      console.info(
        "titre : ids d'étapes des props (mise à jour) ->",
        `${titre.id} : ${JSON.stringify(
          propsTitreEtapesIds
        )} | ${JSON.stringify(titre.propsTitreEtapesIds)}`
      )

      titresPropsEtapesIdsUpdated.push(titre.id)
    }
  }

  return titresPropsEtapesIdsUpdated
}
