import type { ITitreActivite } from '../../types'

import { titreActiviteUpdate } from '../../database/queries/titres-activites'
import { titresGet } from '../../database/queries/titres'
import { titreValideCheck } from '../utils/titre-valide-check'
import { userSuper } from '../../database/user-super'
import { getMonth } from 'camino-common/src/static/frequence'
import { toCaminoDate } from 'camino-common/src/date'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { ActiviteId } from 'camino-common/src/activite'

// TODO 2023-04-12 à supprimer et à calculer lors de l’appel à l’API par un super
export const titresActivitesPropsUpdate = async (titresIds?: string[]): Promise<ActiviteId[]> => {
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

  const titresActivitesUpdated = titres.flatMap(titre => {
    return (titre.activites ?? []).reduce<Pick<ITitreActivite, 'id' | 'suppression'>[]>((acc, titreActivite) => {
      const activiteType = ActivitesTypes[titreActivite.typeId]

      const dateDebut = toCaminoDate(new Date(parseInt(titreActivite.annee), getMonth(activiteType.frequenceId, titreActivite.periodeId), 1))

      const isActiviteInPhase: boolean = isNotNullNorUndefinedNorEmpty(titre.demarches) && titreValideCheck(titre.demarches, dateDebut, titreActivite.date)

      if (isActiviteInPhase && (titreActivite.suppression ?? false)) {
        acc.push({ id: titreActivite.id, suppression: false })
      }

      if (!isActiviteInPhase && !(titreActivite.suppression ?? false)) {
        acc.push({ id: titreActivite.id, suppression: true })
      }

      return acc
    }, [])
  })

  if (titresActivitesUpdated.length) {
    await Promise.all(titresActivitesUpdated.map(activite => titreActiviteUpdate(activite.id, activite)))

    console.info('titre / activités / propriétés (mise à jour) ->', titresActivitesUpdated.map(ta => ta.id).join(', '))
  }

  return titresActivitesUpdated.map(ta => ta.id)
}
