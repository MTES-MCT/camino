import { raw, QueryBuilder } from 'objection'

import { IUtilisateur } from '../../../types'

import { knex } from '../../../knex'

import Titres from '../../models/titres'
import Documents from '../../models/documents'
import TitresActivites from '../../models/titres-activites'

import { documentsQueryModify } from './documents'
import {
  administrationsTitresQuery,
  administrationsActivitesModify
} from './administrations'
import { entreprisesTitresQuery } from './entreprises'
import {
  isAdministration,
  isAdministrationAdmin,
  isAdministrationEditeur,
  isDefault,
  isEntreprise,
  isSuper
} from 'camino-common/src/roles'

const activiteStatuts = [
  {
    id: 'abs',
    name: 'activitesAbsentes'
  },
  {
    id: 'enc',
    name: 'activitesEnConstruction'
  },
  {
    id: 'dep',
    name: 'activitesDeposees'
  }
]

const titreActivitesCount = (
  q: QueryBuilder<Titres, Titres | Titres[]>,
  user: IUtilisateur | null | undefined
) => {
  q.groupBy('titres.id')

  if (isSuper(user) || isAdministration(user) || isEntreprise(user)) {
    const titresActivitesCountQuery = TitresActivites.query()
      .alias('activitesCount')
      .select('activitesCount.titreId')
      .leftJoinRelated('titre')

    activiteStatuts.forEach(({ id, name }) => {
      q.select(`activitesCountJoin.${name}`)

      titresActivitesCountQuery.select(
        raw('count(??) FILTER (WHERE ?? = ?)', [
          'activitesCount.statutId',
          'activitesCount.statutId',
          id
        ]).as(name)
      )
    })

    if (!isSuper(user)) {
      if (isAdministration(user) && user?.administrations?.length) {
        const administrationsIds = user.administrations.map(e => e.id)

        // l'utilisateur fait partie d'une administrations qui a les droits sur le titre
        titresActivitesCountQuery.whereExists(
          administrationsTitresQuery(administrationsIds, 'titre', {
            isGestionnaire: true,
            isAssociee: true,
            isLocale: true
          })
            .leftJoin('administrations__activitesTypes as a_at', b => {
              b.on(
                knex.raw('?? = ??', [
                  'a_at.administrationId',
                  'administrations.id'
                ])
              )
              b.andOn(
                knex.raw('?? = ??', [
                  'a_at.activiteTypeId',
                  'activitesCount.typeId'
                ])
              )
            })
            .whereRaw('?? is not true', ['a_at.lectureInterdit'])
        )
      } else if (isEntreprise(user) && user?.entreprises?.length) {
        const entreprisesIds = user.entreprises.map(e => e.id)

        titresActivitesCountQuery.whereExists(
          entreprisesTitresQuery(entreprisesIds, 'titre', {
            isTitulaire: true,
            isAmodiataire: true
          })
        )
      } else {
        titresActivitesCountQuery.where(false)
      }
    }

    titresActivitesCountQuery.groupBy('activitesCount.titreId')

    q.leftJoin(
      titresActivitesCountQuery.as('activitesCountJoin'),
      raw('?? = ??', ['activitesCountJoin.titreId', 'titres.id'])
    )
  } else if (isDefault(user)) {
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

const titresActivitesQueryModify = (
  q: QueryBuilder<TitresActivites, TitresActivites | TitresActivites[]>,
  user: IUtilisateur | null | undefined,
  select = true
) => {
  if (select) {
    q.select('titresActivites.*')
  }

  q.leftJoinRelated('titre')

  if (isAdministration(user) && user?.administrations?.length) {
    const administrationsIds = user.administrations!.map(a => a.id)

    q.whereExists(
      administrationsTitresQuery(administrationsIds, 'titre', {
        isGestionnaire: true,
        isAssociee: true,
        isLocale: true
      }).modify(administrationsActivitesModify, { lecture: true })
    )
  } else if (isEntreprise(user) && user?.entreprises?.length) {
    // vérifie que l'utilisateur a les permissions sur les titres
    const entreprisesIds = user.entreprises.map(e => e.id)

    q.whereExists(
      entreprisesTitresQuery(entreprisesIds, 'titre', {
        isTitulaire: true,
        isAmodiataire: true
      })
    )
  } else if (!isSuper(user)) {
    // sinon, aucune activité n'est visible
    q.where(false)
  }

  q.modifyGraph('documents', b => {
    documentsQueryModify(
      b as QueryBuilder<Documents, Documents | Documents[]>,
      user
    )
  })

  return q
}

const titresActivitesPropsQueryModify = (
  q: QueryBuilder<TitresActivites, TitresActivites | TitresActivites[]>,
  user: IUtilisateur | null | undefined
) => {
  q.select('titresActivites.*')

  if (isSuper(user)) {
    q.select(raw('true').as('modification'))
  } else if (isAdministration(user) && user?.administrations?.length) {
    if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
      const administrationsIds = user.administrations!.map(a => a.id)

      q.select(
        administrationsTitresQuery(administrationsIds, 'titre', {
          isGestionnaire: true,
          isLocale: true
        })
          .modify(administrationsActivitesModify, {
            lecture: true,
            modification: true
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
    q.select(
      raw('(case when ?? in (?, ?) then true else false end)', [
        'titresActivites.statutId',
        'abs',
        'enc'
      ]).as('modification')
    )
  }

  if (!isSuper(user)) {
    q.select(raw('false').as('suppression'))
  }

  // fileCreate('dev/tmp/titres-activites.sql', format(q.toKnexQuery().toString()))

  return q
}

export {
  titresActivitesQueryModify,
  titresActivitesPropsQueryModify,
  titreActivitesCount
}
