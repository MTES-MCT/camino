import type { ITitreActivite } from '../../types.js'

import { titresActivitesUpsert } from '../../database/queries/titres-activites.js'
import { titresGet } from '../../database/queries/titres.js'
import { titreValideCheck } from '../utils/titre-valide-check.js'
import { userSuper } from '../../database/user-super.js'
import { getMonth } from 'camino-common/src/static/frequence.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes.js'

// TODO 2023-04-12 à supprimer et à calculer lors de l’appel à l’API par un super
export const titresActivitesPropsUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('propriétés des activités de titres…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: { etapes: { id: {} } },
        activites: { id: {} },
      },
    },
    userSuper
  )

  const titresActivitesUpdated = titres.reduce((acc: ITitreActivite[], titre) => {
    if (!titre.activites?.length) return acc

    return titre.activites.reduce((acc, titreActivite) => {
      const activiteType = ActivitesTypes[titreActivite.typeId]

      const dateDebut = toCaminoDate(new Date(titreActivite.annee, getMonth(activiteType.frequenceId, titreActivite.periodeId), 1))

      const isActiviteInPhase = titre.demarches?.length && titreValideCheck(titre.demarches!, dateDebut, titreActivite.date)

      if (isActiviteInPhase && titreActivite.suppression) {
        titreActivite.suppression = null

        acc.push(titreActivite)
      }

      if (!isActiviteInPhase && !titreActivite.suppression) {
        titreActivite.suppression = true

        acc.push(titreActivite)
      }

      return acc
    }, acc)
  }, [])

  if (titresActivitesUpdated.length) {
    await titresActivitesUpsert(titresActivitesUpdated)

    console.info('titre / activités / propriétés (mise à jour) ->', titresActivitesUpdated.map(ta => ta.id).join(', '))
  }

  return titresActivitesUpdated.map(ta => ta.id)
}
