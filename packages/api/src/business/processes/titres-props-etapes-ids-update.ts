import { IPropsTitreEtapesIds, propsTitreEtapeIdKeys } from '../../types.js'

import { titresGet, titreUpdate } from '../../database/queries/titres.js'
import { titrePropTitreEtapeFind } from '../rules/titre-prop-etape-find.js'
import { objectsDiffer } from '../../tools/index.js'
import { userSuper } from '../../database/user-super.js'
import { getCurrent } from 'camino-common/src/date.js'

export const titresPropsEtapesIdsUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('propriétés des titres (liens vers les étapes)…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: {
          etapes: {
            titulaires: { id: {} },
            amodiataires: { id: {} },
          },
        },
      },
    },
    userSuper
  )

  const titresPropsEtapesIdsUpdated = [] as string[]

  const aujourdhui = getCurrent()

  for (const titre of titres) {
    const propsTitreEtapesIds = propsTitreEtapeIdKeys.reduce((propsTitreEtapesIds: IPropsTitreEtapesIds, propId) => {
      const titreEtape = titrePropTitreEtapeFind(aujourdhui, propId, titre.demarches!, titre.titreStatutId!)

      if (titreEtape) {
        propsTitreEtapesIds[propId] = titreEtape.id
      }

      return propsTitreEtapesIds
    }, {})

    if (objectsDiffer(propsTitreEtapesIds, titre.propsTitreEtapesIds)) {
      await titreUpdate(titre.id, { propsTitreEtapesIds })

      console.info("titre : ids d'étapes des props (mise à jour) ->", `${titre.id} : ${JSON.stringify(propsTitreEtapesIds)} | ${JSON.stringify(titre.propsTitreEtapesIds)}`)

      titresPropsEtapesIdsUpdated.push(titre.id)
    }
  }

  return titresPropsEtapesIdsUpdated
}
