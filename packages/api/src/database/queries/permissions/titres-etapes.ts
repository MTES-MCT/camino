import { QueryBuilder } from 'objection'

import Documents from '../../models/documents.js'
import TitresEtapes from '../../models/titres-etapes.js'
import Entreprises from '../../models/entreprises.js'

import { documentsQueryModify } from './documents.js'
import { administrationsTitresTypesEtapesTypesModify, administrationsTitresQuery } from './administrations.js'
import { entreprisesQueryModify, entreprisesTitresQuery } from './entreprises.js'
import { titresDemarchesQueryModify } from './titres-demarches.js'
import TitresDemarches from '../../models/titres-demarches.js'
import Journaux from '../../models/journaux.js'
import { journauxQueryModify } from './journaux.js'
import { isAdministration, isBureauDEtudes, isEntreprise, isSuper, User } from 'camino-common/src/roles.js'

/**
 * Modifie la requête d'étape(s) pour prendre en compte les permissions de l'utilisateur connecté
 *
 * @params q - requête d'étape(s)
 * @params user - utilisateur connecté
 * @returns une requête d'étape(s)
 */
export const titresEtapesQueryModify = (q: QueryBuilder<TitresEtapes, TitresEtapes | TitresEtapes[]>, user: User) => {
  q.select('titresEtapes.*').where('titresEtapes.archive', false).leftJoinRelated('[demarche.titre, type]')

  if (!isSuper(user)) {
    q.where(b => {
      b.orWhere('type.publicLecture', true)

      // étapes visibles pour les admins
      if (isAdministration(user)) {
        b.orWhereExists(
          administrationsTitresQuery(user.administrationId, 'demarche:titre', {
            isGestionnaire: true,
            isAssociee: true,
            isLocale: true,
          }).modify(administrationsTitresTypesEtapesTypesModify, 'lecture', 'demarche:titre.typeId', 'titresEtapes.typeId', user.administrationId)
        )
      } else if ((isEntreprise(user) || isBureauDEtudes(user)) && user.entreprises?.length) {
        const entreprisesIds = user.entreprises.map(a => a.id)

        b.orWhere(c => {
          c.where('type.entreprisesLecture', true)

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

  q.modifyGraph('documents', b => {
    documentsQueryModify(b as QueryBuilder<Documents, Documents | Documents[]>, user)
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
