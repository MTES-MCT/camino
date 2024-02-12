import { QueryBuilder } from 'objection'

import Titres from '../../models/titres.js'
import TitresEtapes from '../../models/titres-etapes.js'
import TitresDemarches from '../../models/titres-demarches.js'

import { titresEtapesQueryModify } from './titres-etapes.js'
import { titresQueryModify } from './titres.js'
import { administrationsTitresQuery } from './administrations.js'
import { entreprisesTitresQuery } from './entreprises.js'
import { isSuper, isAdministration, isEntreprise, isBureauDEtudes, User } from 'camino-common/src/roles.js'

export const titresDemarchesQueryModify = (q: QueryBuilder<TitresDemarches, TitresDemarches | TitresDemarches[]>, user: User) => {
  q.select('titresDemarches.*').where('titresDemarches.archive', false).leftJoinRelated('[titre, type]')

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

          c.whereExists(
            entreprisesTitresQuery(entreprisesIds, 'titre', {
              isTitulaire: true,
              isAmodiataire: true,
            })
          )
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
