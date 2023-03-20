import { raw, QueryBuilder } from 'objection'

import { knex } from '../../../knex.js'

import Titres from '../../models/titres.js'
import Documents from '../../models/documents.js'
import TitresActivites from '../../models/titres-activites.js'

import { documentsQueryModify } from './documents.js'
import { administrationsTitresQuery, administrationsActivitesModify } from './administrations.js'
import { entreprisesTitresQuery } from './entreprises.js'
import { isAdministration, isAdministrationAdmin, isAdministrationEditeur, isEntreprise, isSuper, User } from 'camino-common/src/roles.js'

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

const titreActivitesCount = (q: QueryBuilder<Titres, Titres | Titres[]>, user: User) => {
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
            .leftJoin('administrations__activitesTypes as a_at', b => {
              b.on(knex.raw('?? = ??', ['a_at.administrationId', 'administrations.id']))
              b.andOn(knex.raw('?? = ??', ['a_at.activiteTypeId', 'activitesCount.typeId']))
            })
            .whereRaw('?? is not true', ['a_at.lectureInterdit'])
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

const titresActivitesQueryModify = (q: QueryBuilder<TitresActivites, TitresActivites | TitresActivites[]>, user: User, select = true) => {
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
      }).modify(administrationsActivitesModify, { lecture: true })
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

  q.modifyGraph('documents', b => {
    documentsQueryModify(b as QueryBuilder<Documents, Documents | Documents[]>, user)
  })

  return q
}

const titresActivitesPropsQueryModify = (q: QueryBuilder<TitresActivites, TitresActivites | TitresActivites[]>, user: User) => {
  q.select('titresActivites.*')

  if (isSuper(user)) {
    q.select(raw('true').as('modification'))
  } else if (isAdministration(user)) {
    if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
      q.select(
        administrationsTitresQuery(user.administrationId, 'titre', {
          isGestionnaire: true,
          isLocale: true,
        })
          .modify(administrationsActivitesModify, {
            lecture: true,
            modification: true,
          })
          .select(raw('true'))
          .as('modification')
      )
    } else {
      q.select(raw('false').as('modification'))
    }
  } else if (isEntreprise(user) && user?.entreprises?.length) {
    // vérifie que l'utilisateur a les droits d'édition sur l'activité
    // l'activité doit avoir un statut `absente ou `en cours`
    q.select(raw('(case when ?? in (?, ?) then true else false end)', ['titresActivites.activiteStatutId', 'abs', 'enc']).as('modification'))
  }

  if (!isSuper(user)) {
    q.select(raw('false').as('suppression'))
  }

  return q
}

export { titresActivitesQueryModify, titresActivitesPropsQueryModify, titreActivitesCount }
