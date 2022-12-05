import { titresGet, titreUpdate } from '../../database/queries/titres.js'
import { titreStatutIdFind } from '../rules/titre-statut-id-find.js'
import { userSuper } from '../../database/user-super.js'
import { getCurrent } from 'camino-common/src/date.js'

export const titresStatutIdsUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('statut des titres…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: {
          type: { id: {} },
          phase: { id: {} },
          etapes: { points: { id: {} } }
        }
      }
    },
    userSuper
  )

  const titresUpdated = [] as string[]
  const aujourdhui = getCurrent()

  for (const titre of titres) {
    const titreStatutId = titreStatutIdFind(
      aujourdhui,
      titre.demarches,
      titre.typeId
    )

    if (titreStatutId !== titre.titreStatutId) {
      await titreUpdate(titre.id, { titreStatutId })

      console.info(
        'titre : statut (mise à jour) ->',
        `${titre.id} : ${titreStatutId}`
      )

      titresUpdated.push(titre.id)
    }
  }

  return titresUpdated
}
