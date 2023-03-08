import { titreActiviteUpdate, titresActivitesGet } from '../../database/queries/titres-activites.js'
import { titreActiviteStatutIdFind } from '../rules/titre-activite-statut-id-find.js'
import { userSuper } from '../../database/user-super.js'
import { getCurrent } from 'camino-common/src/date.js'

// met à jour le statut des activités d'un titre
export const titresActivitesStatutIdsUpdate = async () => {
  console.info()
  console.info('statut des activités…')

  const titresActivites = await titresActivitesGet({}, {}, userSuper)

  const aujourdhui = getCurrent()

  const titresActivitesUpdated = [] as string[]
  for (const titreActivite of titresActivites) {
    const activiteStatutId = titreActiviteStatutIdFind(titreActivite, aujourdhui)

    if (titreActivite.activiteStatutId !== activiteStatutId) {
      await titreActiviteUpdate(titreActivite.id, { activiteStatutId })

      console.info('titre / activité : statut (mise à jour) ->', `${titreActivite.id}: ${activiteStatutId}`)

      titresActivitesUpdated.push(titreActivite.id)
    }
  }

  return titresActivitesUpdated
}
