import { QueryBuilder } from 'objection'

import TitresActivites from '../../models/titres-activites.js'

import { administrationsTitresQuery } from './administrations.js'
import { entreprisesTitresQuery } from './entreprises.js'
import { isAdministration, isEntreprise, isSuper, User } from 'camino-common/src/roles.js'

export const titresActivitesQueryModify = (q: QueryBuilder<TitresActivites, TitresActivites | TitresActivites[]>, user: User) => {
  q.select('titresActivites.*')

  q.leftJoinRelated('titre')

  if (isAdministration(user)) {
    q.joinRaw(`left join titres_etapes t_e on t_e.id = "titre"."props_titre_etapes_ids" ->> 'points' and t_e.administrations_locales @> '"${user.administrationId}"'::jsonb`)
    q.modify(administrationsTitresQuery, user.administrationId, 'titre', 'and', 't_e')
  } else if (isEntreprise(user) && user?.entreprises?.length) {
    // vérifie que l'utilisateur a les permissions sur les titres
    const entreprisesIds = user.entreprises.map(e => e.id)

    q.whereExists(
      entreprisesTitresQuery(entreprisesIds, 'titre', {
        isTitulaire: true,
        isAmodiataire: true,
      })
    )
  } else if (!isSuper(user)) {
    // sinon, aucune activité n'est visible
    q.where(false)
  }

  return q
}
