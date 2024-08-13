import { QueryBuilder } from 'objection'

import TitresActivites from '../../models/titres-activites'

import { administrationsTitresQuery } from './administrations'
import { entreprisesTitresQuery } from './entreprises'
import { isAdministration, isEntreprise, isSuper, User } from 'camino-common/src/roles'
import { DeepReadonly } from 'camino-common/src/typescript-tools'

export const titresActivitesQueryModify = (q: QueryBuilder<TitresActivites, TitresActivites | TitresActivites[]>, user: DeepReadonly<User>) => {
  q.select('titresActivites.*')

  q.leftJoinRelated('titre')

  if (isAdministration(user)) {
    q.joinRaw(`left join titres_etapes t_e on t_e.id = "titre"."props_titre_etapes_ids" ->> 'points' and t_e.administrations_locales @> '"${user.administrationId}"'::jsonb`)
    q.modify(administrationsTitresQuery, user.administrationId, 'titre', 'and', 't_e')
  } else if (isEntreprise(user) && user?.entrepriseIds?.length) {
    // vérifie que l'utilisateur a les permissions sur les titres
    const entreprisesIds = user.entrepriseIds

    q.whereExists(entreprisesTitresQuery(entreprisesIds, 'titre'))
  } else if (!isSuper(user)) {
    // sinon, aucune activité n'est visible
    q.where(false)
  }

  return q
}
