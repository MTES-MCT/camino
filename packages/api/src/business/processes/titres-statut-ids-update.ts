import dateFormat from 'dateformat'

import { titresGet, titreUpdate } from '../../database/queries/titres'
import { titreStatutIdFind } from '../rules/titre-statut-id-find'
import { userSuper } from '../../database/user-super'

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
  const aujourdhui = dateFormat(new Date(), 'yyyy-mm-dd')

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
