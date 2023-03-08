import type { ITitreActivite } from '../../types.js'

import { titresActivitesUpsert } from '../../database/queries/titres-activites.js'
import { titresGet } from '../../database/queries/titres.js'
import { titreValideCheck } from '../utils/titre-valide-check.js'
import { userSuper } from '../../database/user-super.js'
import { getMonth } from 'camino-common/src/static/frequence.js'
import { toCaminoDate } from 'camino-common/src/date.js'

export const titresActivitesPropsUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('propriétés des activités de titres…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: { phase: { id: {} }, etapes: { id: {} }, type: { id: {} } },
        activites: {
          type: { id: {} },
        },
      },
    },
    userSuper
  )

  const titresActivitesUpdated = titres.reduce((acc: ITitreActivite[], titre) => {
    if (!titre.activites?.length) return acc

    return titre.activites.reduce((acc, titreActivite) => {
      const dateDebut = toCaminoDate(new Date(titreActivite.annee, getMonth(titreActivite.type?.frequenceId, titreActivite.periodeId), 1))

      const titreIsValide = titre.demarches?.length && titreValideCheck(titre.demarches!, dateDebut, titreActivite.date, titre.typeId, true)

      if (titreIsValide && titreActivite.suppression) {
        titreActivite.suppression = null

        acc.push(titreActivite)
      }

      if (!titreIsValide && !titreActivite.suppression) {
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
