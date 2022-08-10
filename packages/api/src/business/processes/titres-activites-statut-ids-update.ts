import dateFormat from 'dateformat'

import {
  titreActiviteUpdate,
  titresActivitesGet
} from '../../database/queries/titres-activites'
import { titreActiviteStatutIdFind } from '../rules/titre-activite-statut-id-find'
import { userSuper } from '../../database/user-super'

// met à jour le statut des activités d'un titre
export const titresActivitesStatutIdsUpdate = async () => {
  console.info()
  console.info('statut des activités…')

  const titresActivites = await titresActivitesGet({}, {}, userSuper)

  const aujourdhui = dateFormat(new Date(), 'yyyy-mm-dd')

  const titresActivitesUpdated = [] as string[]
  for (const titreActivite of titresActivites) {
    const statutId = titreActiviteStatutIdFind(titreActivite, aujourdhui)

    if (titreActivite.statutId !== statutId) {
      await titreActiviteUpdate(titreActivite.id, { statutId })

      console.info(
        'titre / activité : statut (mise à jour) ->',
        `${titreActivite.id}: ${statutId}`
      )

      titresActivitesUpdated.push(titreActivite.id)
    }
  }

  return titresActivitesUpdated
}
