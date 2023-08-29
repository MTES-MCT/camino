import { raw, QueryBuilder } from 'objection'

import Titres from '../../models/titres.js'
import TitresActivites from '../../models/titres-activites.js'

import { administrationsTitresQuery } from './administrations.js'
import { entreprisesTitresQuery } from './entreprises.js'
import { isAdministration, isEntreprise, isSuper, User } from 'camino-common/src/roles.js'

const activiteStatuts = [
  {
    id: 'abs',
    name: 'activitesAbsentes',
  },
  {
    id: 'enc',
    name: 'activitesEnConstruction',
  },
  {
    id: 'dep',
    name: 'activitesDeposees',
  },
]

export const titreActivitesCount = (q: QueryBuilder<Titres, Titres | Titres[]>, user: User) => {
  q.groupBy('titres.id')

  if (isSuper(user) || isAdministration(user) || isEntreprise(user)) {
    const titresActivitesCountQuery = TitresActivites.query().alias('activitesCount').select('activitesCount.titreId').leftJoinRelated('titre')

    activiteStatuts.forEach(({ id, name }) => {
      q.select(`activitesCountJoin.${name}`)

      titresActivitesCountQuery.select(raw('count(??) FILTER (WHERE ?? = ?)', ['activitesCount.activiteStatutId', 'activitesCount.activiteStatutId', id]).as(name))
    })

    if (!isSuper(user)) {
      if (isAdministration(user)) {
        // l'utilisateur fait partie d'une administrations qui a les droits sur le titre
        titresActivitesCountQuery.whereExists(
          administrationsTitresQuery(user.administrationId, 'titre', {
            isGestionnaire: true,
            isAssociee: true,
            isLocale: true,
          })
        )
      } else if (isEntreprise(user) && user?.entreprises?.length) {
        const entreprisesIds = user.entreprises.map(e => e.id)

        titresActivitesCountQuery.whereExists(
          entreprisesTitresQuery(entreprisesIds, 'titre', {
            isTitulaire: true,
            isAmodiataire: true,
          })
        )
      } else {
        titresActivitesCountQuery.where(false)
      }
    }

    titresActivitesCountQuery.groupBy('activitesCount.titreId')

    q.leftJoin(titresActivitesCountQuery.as('activitesCountJoin'), raw('?? = ??', ['activitesCountJoin.titreId', 'titres.id']))
  } else {
    // les utilisateurs non-authentifiés ou défaut ne peuvent voir aucune activité
    activiteStatuts.forEach(({ name }) => {
      q.select(raw('0').as(name))
    })
  }

  activiteStatuts.forEach(({ name }) => {
    q.groupBy(name)
  })

  return q
}

export const titresActivitesQueryModify = (q: QueryBuilder<TitresActivites, TitresActivites | TitresActivites[]>, user: User, select = true) => {
  if (select) {
    q.select('titresActivites.*')
  }

  q.leftJoinRelated('titre')

  if (isAdministration(user)) {
    q.whereExists(
      administrationsTitresQuery(user.administrationId, 'titre', {
        isGestionnaire: true,
        isAssociee: true,
        isLocale: true,
      })
    )
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

export const titresActivitesPropsQueryModify = (q: QueryBuilder<TitresActivites, TitresActivites | TitresActivites[]>, user: User) => {
  q.select('titresActivites.*')
  if (!isSuper(user)) {
    // Override le champ suppression qui est présent dans la table titres_activites...
    q.select(raw('false').as('suppression'))
  }

  return q
}
