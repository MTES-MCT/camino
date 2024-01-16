import { raw, QueryBuilder, RawBuilder } from 'objection'

import Titres from '../../models/titres.js'
import TitresEtapes from '../../models/titres-etapes.js'
import TitresDemarches from '../../models/titres-demarches.js'

import { titresEtapesQueryModify } from './titres-etapes.js'
import { titresQueryModify } from './titres.js'
import { administrationsTitresQuery } from './administrations.js'
import { entreprisesTitresQuery } from './entreprises.js'
import { isSuper, isAdministration, isEntreprise, isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, User } from 'camino-common/src/roles.js'

export const titresDemarchesQueryModify = (q: QueryBuilder<TitresDemarches, TitresDemarches | TitresDemarches[]>, user: User) => {
  q.select('titresDemarches.*').where('titresDemarches.archive', false).leftJoinRelated('[titre, type]')

  if (!isSuper(user)) {
    q.whereExists(titresQueryModify((TitresDemarches.relatedQuery('titre') as QueryBuilder<Titres, Titres | Titres[]>).alias('titres'), user))

    q.where(b => {
      b.orWhere('titresDemarches.publicLecture', true)

      if (isAdministration(user)) {
        const administrationTitre = administrationsTitresQuery(user.administrationId, 'titre', {
          isGestionnaire: true,
          isAssociee: true,
          isLocale: true,
        })

        b.orWhereExists(administrationTitre)
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

  q.select(titreDemarcheSuppressionSelectQuery('titresDemarches', user).as('suppression'))

  q.modifyGraph('etapes', b => {
    titresEtapesQueryModify(b as QueryBuilder<TitresEtapes, TitresEtapes | TitresEtapes[]>, user)
  })

  q.modifyGraph('titre', a => titresQueryModify(a as QueryBuilder<Titres, Titres | Titres[]>, user))

  return q
}

export const titreDemarcheSuppressionSelectQuery = (demarcheAlias: string, user: User): RawBuilder => {
  if (isSuper(user)) {
    return raw('true')
  }

  if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return raw('NOT EXISTS(??)', [
      TitresEtapes.query()
        .alias('titresEtapesSuppression')
        .select('titresEtapesSuppression.id')
        .where('titresEtapesSuppression.archive', false)
        .whereRaw('?? = ??', [`${demarcheAlias}.id`, 'titresEtapesSuppression.titreDemarcheId'])
        .first(),
    ])
  }

  return raw('false')
}
