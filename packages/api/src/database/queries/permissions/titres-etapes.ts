import { QueryBuilder } from 'objection'

import TitresEtapes from '../../models/titres-etapes.js'
import Entreprises from '../../models/entreprises.js'

import { administrationsTitresQuery } from './administrations.js'
import { entreprisesQueryModify, entreprisesTitresQuery } from './entreprises.js'
import { titresDemarchesQueryModify } from './titres-demarches.js'
import TitresDemarches from '../../models/titres-demarches.js'
import Journaux from '../../models/journaux.js'
import { journauxQueryModify } from './journaux.js'
import { isAdministration, isBureauDEtudes, isEntreprise, isSuper, User } from 'camino-common/src/roles.js'
import { getAdministrationTitresTypesEtapesTypes } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes.js'
import { knex } from '../../../knex.js'
import { EtapeTypeId, etapesTypes } from 'camino-common/src/static/etapesTypes.js'

/**
 * Modifie la requête d'étape(s) pour prendre en compte les permissions de l'utilisateur connecté
 *
 * @params q - requête d'étape(s)
 * @params user - utilisateur connecté
 * @returns une requête d'étape(s)
 */
export const titresEtapesQueryModify = (q: QueryBuilder<TitresEtapes, TitresEtapes | TitresEtapes[]>, user: User) => {
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
      } else if ((isEntreprise(user) || isBureauDEtudes(user)) && user.entreprises?.length) {
        const entreprisesIds = user.entreprises.map(a => a.id)

        b.orWhere(c => {
          const etapeTypeIdsEntreprisePublic: EtapeTypeId[] = etapesTypes.filter(({ entreprises_lecture }) => entreprises_lecture).map(({ id }) => id)
          c.whereIn('titresEtapes.typeId', etapeTypeIdsEntreprisePublic)

          c.whereExists(
            entreprisesTitresQuery(entreprisesIds, 'demarche:titre', {
              isTitulaire: true,
              isAmodiataire: true,
            })
          )
        })
      }
    })
  }

  q.modifyGraph('demarche', b => {
    titresDemarchesQueryModify(b as QueryBuilder<TitresDemarches, TitresDemarches | TitresDemarches[]>, user)
  })

  q.modifyGraph('titulaires', b => {
    entreprisesQueryModify(b as QueryBuilder<Entreprises, Entreprises | Entreprises[]>, user).select('titresTitulaires.operateur')
  })

  q.modifyGraph('amodiataires', b => {
    entreprisesQueryModify(b as QueryBuilder<Entreprises, Entreprises | Entreprises[]>, user).select('titresAmodiataires.operateur')
  })

  q.modifyGraph('journaux', b => {
    journauxQueryModify(b as QueryBuilder<Journaux, Journaux | Journaux[]>, user)
  })

  return q
}
