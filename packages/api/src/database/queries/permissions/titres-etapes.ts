import { QueryBuilder } from 'objection'

import TitresEtapes from '../../models/titres-etapes'

import { administrationsTitresQuery } from './administrations'
import { entreprisesTitresQuery } from './entreprises'
import { titresDemarchesQueryModify } from './titres-demarches'
import TitresDemarches from '../../models/titres-demarches'
import Journaux from '../../models/journaux'
import { journauxQueryModify } from './journaux'
import { isAdministration, isBureauDEtudes, isEntreprise, isSuper, User } from 'camino-common/src/roles'
import { getAdministrationTitresTypesEtapesTypes } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes'
import { knex } from '../../../knex'
import { EtapeTypeId, etapesTypes } from 'camino-common/src/static/etapesTypes'
import { DeepReadonly } from 'camino-common/src/typescript-tools'

/**
 * Modifie la requête d'étape(s) pour prendre en compte les permissions de l'utilisateur connecté
 *
 * @params q - requête d'étape(s)
 * @params user - utilisateur connecté
 * @returns une requête d'étape(s)
 */
export const titresEtapesQueryModify = (q: QueryBuilder<TitresEtapes, TitresEtapes | TitresEtapes[]>, user: DeepReadonly<User>) => {
  q.select('titresEtapes.*').where('titresEtapes.archive', false).leftJoinRelated('[demarche.titre]')

  if (!isSuper(user)) {
    const etapePointAlias = 't_e'
    if (isAdministration(user)) {
      q.joinRaw(
        `left join titres_etapes as ${etapePointAlias} on ${etapePointAlias}.id = "demarche:titre"."props_titre_etapes_ids" ->> 'points' and ${etapePointAlias}.administrations_locales @> '"${user.administrationId}"'::jsonb`
      )
    }

    q.where(b => {
      const etapeTypeIdsPublic: EtapeTypeId[] = etapesTypes.filter(({ public_lecture }) => public_lecture).map(({ id }) => id)
      b.orWhereIn('titresEtapes.typeId', etapeTypeIdsPublic)

      // étapes visibles pour les admins
      if (isAdministration(user)) {
        b.modify(administrationsTitresQuery, user.administrationId, 'demarche:titre', 'or', etapePointAlias)

        // l'utilisateur est dans au moins une administration
        // qui n'a pas de restriction 'creationInterdit' sur ce type d'étape / type de titre
        const restrictions = getAdministrationTitresTypesEtapesTypes(user.administrationId).filter(r => r.lectureInterdit)
        if (restrictions.length) {
          b.whereNot(b =>
            restrictions.forEach(r => b.orWhere(c => c.where(knex.raw('?? = ?', ['demarche:titre.typeId', r.titreTypeId])).where(knex.raw('?? = ?', ['titresEtapes.typeId', r.etapeTypeId]))))
          )
        }
      } else if ((isEntreprise(user) || isBureauDEtudes(user)) && user.entrepriseIds?.length) {
        const entreprisesIds = user.entrepriseIds

        b.orWhere(c => {
          const etapeTypeIdsEntreprisePublic: EtapeTypeId[] = etapesTypes.filter(({ entreprises_lecture }) => entreprises_lecture).map(({ id }) => id)
          c.whereIn('titresEtapes.typeId', etapeTypeIdsEntreprisePublic)

          c.whereExists(entreprisesTitresQuery(entreprisesIds, 'demarche:titre'))
        })
      }
    })
  }

  q.modifyGraph('demarche', b => {
    titresDemarchesQueryModify(b as QueryBuilder<TitresDemarches, TitresDemarches | TitresDemarches[]>, user)
  })

  q.modifyGraph('journaux', b => {
    journauxQueryModify(b as QueryBuilder<Journaux, Journaux | Journaux[]>, user)
  })

  return q
}
