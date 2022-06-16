import { raw, QueryBuilder } from 'objection'

import { IUtilisateur } from '../../../types'

import { knex } from '../../../knex'

// eslint-disable-next-line import/no-named-default
import { default as AdministrationsModel } from '../../models/administrations'
import Utilisateurs from '../../models/utilisateurs'
import Titres from '../../models/titres'

import { titresQueryModify } from './titres'
import { utilisateursQueryModify } from './utilisateurs'
import { administrationsActivitesTypesEmailsQueryModify } from './administrations-activites-types-emails'
import Departements from '../../models/departements'
import ActivitesTypes from '../../models/activites-types'
import {
  isAdministration,
  isAdministrationAdmin,
  isAdministrationEditeur,
  isSuper
} from 'camino-common/src/roles'
import {
  AdministrationId,
  Administrations
} from 'camino-common/src/administrations'

const departementsQuery = (
  administrationsId: AdministrationId,
  administrationAlias: string
) =>
  Departements.query()
    .select(raw('true'))
    .leftJoin('administrations as adm', 'departements.regionId', 'adm.regionId')
    .whereRaw('?? = ??', [
      'departements.id',
      `${administrationAlias}.departementId`
    ])
    .where('adm.id', administrationsId)

const emailsLectureQuery = (
  user: IUtilisateur | null | undefined,
  administrationAlias: string
) => {
  if (
    isSuper(user) ||
    (isAdministration(user) &&
      Administrations[user.administrationId].typeId === 'min')
  ) {
    // Utilisateur super ou membre de ministère (admin ou éditeur) : tous les droits
    return raw('true')
  } else if (isAdministration(user)) {
    return raw(`((??) OR (${administrationAlias}.id = ?))`, [
      departementsQuery(user.administrationId, administrationAlias),
      user.administrationId
    ])
  }

  return raw('false')
}

const administrationsQueryModify = (
  q: QueryBuilder<
    AdministrationsModel,
    AdministrationsModel | AdministrationsModel[]
  >,
  user: IUtilisateur | null | undefined
): QueryBuilder<
  AdministrationsModel,
  AdministrationsModel | AdministrationsModel[]
> => {
  q.select('administrations.*')

  if (isSuper(user)) {
    q.select(raw('true').as('modification'))
  }

  if (
    isSuper(user) ||
    ((isAdministrationAdmin(user) || isAdministrationEditeur(user)) &&
      Administrations[user.administrationId].typeId === 'min')
  ) {
    // Utilisateur super ou membre de ministère (admin ou éditeur) : tous les droits
    q.select(raw('true').as('emailsModification'))
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    // Membre d'une DREAL/DEAL vis-à-vis de la DREAL elle-même,
    // ou d'un DREAL/DEAL vis-à-vis d'une administration qui dépend d'elles
    // Admin ou éditeur : modifications
    // Admin, éditeur ou lecteur : lecture
    q.select(
      raw(
        `((??) OR (administrations.id = ? AND administrations.type_id IN (?,?)))`,
        [
          departementsQuery(user.administrationId, 'administrations'),
          user.administrationId,
          'dre',
          'dea'
        ]
      ).as('emailsModification')
    )
  }

  q.select(emailsLectureQuery(user, 'administrations').as('emailsLecture'))

  q.modifyGraph('activitesTypesEmails', a =>
    administrationsActivitesTypesEmailsQueryModify(
      a as QueryBuilder<ActivitesTypes, ActivitesTypes | ActivitesTypes[]>,
      user
    )
  )

  q.modifyGraph('gestionnaireTitres', a =>
    titresQueryModify(a as QueryBuilder<Titres, Titres | Titres[]>, user)
      // on group by administrationId au cas où il y a une aggrégation
      // dans la requête de titre (ex : calc activités)
      .groupBy(
        'titres.id',
        'titresAdministrationsGestionnaires.administrationId'
      )
  )

  q.modifyGraph('localeTitres', a =>
    titresQueryModify(a as QueryBuilder<Titres, Titres | Titres[]>, user)
      // on group by administrationId au cas où il y a une aggrégation
      // dans la requête de titre (ex : calc activités)
      .groupBy('titres.id', 'titresAdministrationsLocales.administrationId')
  )

  q.modifyGraph('utilisateurs', b => {
    utilisateursQueryModify(
      b as QueryBuilder<Utilisateurs, Utilisateurs | Utilisateurs[]>,
      user
    )
  })

  return q
}

const administrationsTitresTypesModify = (
  q: QueryBuilder<
    AdministrationsModel,
    AdministrationsModel | AdministrationsModel[]
  >,
  administrationsId: AdministrationId,
  titreAlias: string,
  {
    isGestionnaire,
    isAssociee
  }: { isGestionnaire?: boolean; isAssociee?: boolean } = {}
) => {
  q.leftJoin('administrations__titresTypes as a_tt', b => {
    b.on(knex.raw('?? = ??', ['a_tt.administrationId', 'administrations.id']))
    b.andOn(knex.raw('?? = ??', ['a_tt.titreTypeId', `${titreAlias}.typeId`]))
    b.andOn('administrations.id', administrationsId)
    if (isGestionnaire || isAssociee) {
      b.andOn(c => {
        if (isGestionnaire) {
          c.orOn(knex.raw('?? is true', ['a_tt.gestionnaire']))
        }
        if (isAssociee) {
          c.orOn(knex.raw('?? is true', ['a_tt.associee']))
        }
      })
    }
  })
}

const administrationsLocalesModify = (
  q: QueryBuilder<
    AdministrationsModel,
    AdministrationsModel | AdministrationsModel[]
  >,
  administrationsId: AdministrationId,
  titreAlias: string
) => {
  q.leftJoin('titresAdministrationsLocales as t_al', b => {
    b.on(
      knex.raw('?? ->> ? = ??', [
        `${titreAlias}.propsTitreEtapesIds`,
        'administrations',
        't_al.titreEtapeId'
      ])
    )
    b.on('t_al.administrationId', administrationsId)
  })
}

const administrationsActivitesModify = (
  q: QueryBuilder<
    AdministrationsModel,
    AdministrationsModel | AdministrationsModel[]
  >,

  { lecture, modification }: { lecture?: boolean; modification?: boolean }
) => {
  q.leftJoin('administrations__activitesTypes as a_at', b => {
    b.on(knex.raw('?? = ??', ['a_at.administrationId', 'administrations.id']))
    b.andOn(
      knex.raw('?? = ??', ['a_at.activiteTypeId', 'titresActivites.typeId'])
    )
    b.andOn(c => {
      if (lecture) {
        c.orOn(knex.raw('?? is true', ['a_at.lectureInterdit']))
      }
      if (modification) {
        c.orOn(knex.raw('?? is true', ['a_at.modificationInterdit']))
      }
    })
  })
  q.whereNull('a_at.administrationId')
}

const administrationsTitresQuery = (
  administrationId: AdministrationId,
  titreAlias: string,
  {
    isGestionnaire,
    isAssociee,
    isLocale
  }: { isGestionnaire?: boolean; isAssociee?: boolean; isLocale?: boolean } = {}
) => {
  const q = AdministrationsModel.query().where(
    'administrations.id',
    administrationId
  )

  if (isGestionnaire || isAssociee) {
    q.modify(administrationsTitresTypesModify, administrationId, titreAlias, {
      isGestionnaire,
      isAssociee
    })
  }

  if (isLocale) {
    q.modify(administrationsLocalesModify, administrationId, titreAlias)
  }

  q.where(c => {
    if (isGestionnaire || isAssociee) {
      c.orWhereNotNull('a_tt.administrationId')
    }

    if (isLocale) {
      c.orWhereNotNull('t_al.administrationId')
    }
  })

  return q
}

const administrationsTitresTypesTitresStatutsModify = (
  q: QueryBuilder<
    AdministrationsModel,
    AdministrationsModel | AdministrationsModel[]
  >,
  type: 'titres' | 'demarches' | 'etapes',
  titreAlias: string,
  conditionsAdd?: (
    b: QueryBuilder<
      AdministrationsModel,
      AdministrationsModel | AdministrationsModel[]
    >
  ) => void
) => {
  q.leftJoin('administrations__titresTypes__titresStatuts as a_tt_ts', b => {
    b.on(
      knex.raw('?? = ??', ['a_tt_ts.administrationId', 'administrations.id'])
    )
    b.andOn(
      knex.raw('?? = ??', ['a_tt_ts.titreTypeId', `${titreAlias}.typeId`])
    )
    b.andOn(
      knex.raw('?? = ??', ['a_tt_ts.titreStatutId', `${titreAlias}.statutId`])
    )
    b.andOn(knex.raw('?? is true', [`a_tt_ts.${type}ModificationInterdit`]))
  })

  q.where(b => {
    b.orWhereNull('a_tt_ts.administrationId')
    if (conditionsAdd) {
      conditionsAdd(b)
    }
  })
}

// l'utilisateur est dans au moins une administration
// qui n'a pas de restriction 'creationInterdit' sur ce type d'étape / type de titre
const administrationsTitresTypesEtapesTypesModify = (
  q: QueryBuilder<
    AdministrationsModel,
    AdministrationsModel | AdministrationsModel[]
  >,
  type: 'lecture' | 'modification' | 'creation',
  titreTypeIdColumn: string,
  etapeTypeIdColumn: string
) => {
  q.leftJoin('administrations__titresTypes__etapesTypes as a_tt_et', b => {
    b.on(
      knex.raw('?? = ??', ['a_tt_et.administrationId', 'administrations.id'])
    )
    b.andOn(knex.raw('?? = ??', ['a_tt_et.titreTypeId', titreTypeIdColumn]))
    b.andOn(knex.raw('?? = ??', ['a_tt_et.etapeTypeId', etapeTypeIdColumn]))
    b.andOn(knex.raw('?? is true', [`a_tt_et.${type}Interdit`]))
  }).whereNull('a_tt_et.administrationId')
}

export {
  administrationsQueryModify,
  administrationsLocalesModify,
  administrationsTitresTypesTitresStatutsModify,
  administrationsTitresTypesEtapesTypesModify,
  administrationsTitresQuery,
  administrationsActivitesModify,
  emailsLectureQuery
}
