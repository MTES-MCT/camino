import type { ITitreActivite } from '../../types'

import { titresActivitesUpsert } from '../../database/queries/titres-activites'
import { titresGet } from '../../database/queries/titres'
import { titreValideCheck } from '../utils/titre-valide-check'
import { userSuper } from '../../database/user-super'
import { getMonth } from 'camino-common/src/static/frequence'
import { toCaminoDate } from 'camino-common/src/date'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'

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
    if (isNullOrUndefinedOrEmpty(titre.activites)) {
      return acc
    }

    return titre.activites.reduce((acc, titreActivite) => {
      const activiteType = ActivitesTypes[titreActivite.typeId]

      const dateDebut = toCaminoDate(new Date(titreActivite.annee, getMonth(activiteType.frequenceId, titreActivite.periodeId), 1))

      const isActiviteInPhase: boolean = isNotNullNorUndefinedNorEmpty(titre.demarches) && titreValideCheck(titre.demarches, dateDebut, titreActivite.date)

      if (isActiviteInPhase && (titreActivite.suppression ?? false)) {
        titreActivite.suppression = false

        acc.push(titreActivite)
      }

      if (!isActiviteInPhase && !(titreActivite.suppression ?? false)) {
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
