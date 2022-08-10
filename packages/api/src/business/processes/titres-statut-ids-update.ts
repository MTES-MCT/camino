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
    const statutId = titreStatutIdFind(
      aujourdhui,
      titre.demarches,
      titre.typeId
    )

    if (statutId !== titre.statutId) {
      await titreUpdate(titre.id, { statutId })

      console.info(
        'titre : statut (mise à jour) ->',
        `${titre.id} : ${statutId}`
      )

      titresUpdated.push(titre.id)
    }
  }

  return titresUpdated
}
