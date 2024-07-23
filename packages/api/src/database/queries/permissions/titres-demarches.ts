import { QueryBuilder } from 'objection'

import Titres from '../../models/titres'
import TitresEtapes from '../../models/titres-etapes'
import TitresDemarches from '../../models/titres-demarches'

import { titresEtapesQueryModify } from './titres-etapes'
import { titresQueryModify } from './titres'
import { administrationsTitresQuery } from './administrations'
import { entreprisesTitresQuery } from './entreprises'
import { isSuper, isAdministration, isEntreprise, isBureauDEtudes, User } from 'camino-common/src/roles'
import { DeepReadonly } from 'camino-common/src/typescript-tools'

export const titresDemarchesQueryModify = (q: QueryBuilder<TitresDemarches, TitresDemarches | TitresDemarches[]>, user: DeepReadonly<User>) => {
  q.select('titresDemarches.*').where('titresDemarches.archive', false).leftJoinRelated('titre')

  if (!isSuper(user)) {
    q.whereExists(titresQueryModify((TitresDemarches.relatedQuery('titre') as QueryBuilder<Titres, Titres | Titres[]>).alias('titres'), user))

    const etapePointAlias = 't_e'
    if (isAdministration(user)) {
      q.joinRaw(
        `left join titres_etapes ${etapePointAlias} on ${etapePointAlias}.id = "titre"."props_titre_etapes_ids" ->> 'points' and ${etapePointAlias}.administrations_locales @> '"${user.administrationId}"'::jsonb`
      )
    }
    q.where(b => {
      b.orWhere('titresDemarches.publicLecture', true)

      if (isAdministration(user)) {
        b.modify(administrationsTitresQuery, user.administrationId, 'titre', 'or', etapePointAlias)
      } else if ((isEntreprise(user) || isBureauDEtudes(user)) && user.entreprises?.length) {
        const entreprisesIds = user.entreprises.map(e => e.id)

        b.orWhere(c => {
          c.where('titresDemarches.entreprisesLecture', true)

          c.whereExists(entreprisesTitresQuery(entreprisesIds, 'titre'))
        })
      }
    })
  }

  q.modifyGraph('etapes', b => {
    titresEtapesQueryModify(b as QueryBuilder<TitresEtapes, TitresEtapes | TitresEtapes[]>, user)
  })

  q.modifyGraph('titre', a => titresQueryModify(a as QueryBuilder<Titres, Titres | Titres[]>, user))

  return q
}
