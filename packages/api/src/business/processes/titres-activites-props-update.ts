import dateFormat from 'dateformat'

import { ITitreActivite } from '../../types'

import { titresActivitesUpsert } from '../../database/queries/titres-activites'
import { titresGet } from '../../database/queries/titres'
import { titreValideCheck } from '../utils/titre-valide-check'
import { userSuper } from '../../database/user-super'
import { getMonth } from 'camino-common/src/static/frequence'

export const titresActivitesPropsUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('propriétés des activités de titres…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: { phase: { id: {} }, etapes: { id: {} }, type: { id: {} } },
        activites: {
          type: { id: {} }
        }
      }
    },
    userSuper
  )

  const titresActivitesUpdated = titres.reduce(
    (acc: ITitreActivite[], titre) => {
      if (!titre.activites?.length) return acc

      return titre.activites.reduce((acc, titreActivite) => {
        const dateDebut = dateFormat(
          new Date(
            titreActivite.annee,
            getMonth(titreActivite.type?.frequenceId, titreActivite.periodeId),
            1
          ),
          'yyyy-mm-dd'
        )

        const titreIsValide =
          titre.demarches?.length &&
          titreValideCheck(
            titre.demarches!,
            dateDebut,
            titreActivite.date,
            titre.typeId,
            true
          )

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
    },
    []
  )

  if (titresActivitesUpdated.length) {
    await titresActivitesUpsert(titresActivitesUpdated)

    console.info(
      'titre / activités / propriétés (mise à jour) ->',
      titresActivitesUpdated.map(ta => ta.id).join(', ')
    )
  }

  return titresActivitesUpdated.map(ta => ta.id)
}
