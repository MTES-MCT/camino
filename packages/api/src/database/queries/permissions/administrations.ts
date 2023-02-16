import { raw, QueryBuilder } from 'objection'

import { knex } from '../../../knex.js'

import AdministrationsModel from '../../models/administrations.js'
import Utilisateurs from '../../models/utilisateurs.js'
import { utilisateursQueryModify } from './utilisateurs.js'
import { isSuper, User } from 'camino-common/src/roles.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { getTitreTypeIdsByAdministration } from 'camino-common/src/static/administrationsTitresTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'

const administrationsQueryModify = (
  q: QueryBuilder<
    AdministrationsModel,
    AdministrationsModel | AdministrationsModel[]
  >,
  user: User
): QueryBuilder<
  AdministrationsModel,
  AdministrationsModel | AdministrationsModel[]
> => {
  q.select('administrations.*')

  if (isSuper(user)) {
    q.select(raw('true').as('modification'))
  }

  q.modifyGraph('utilisateurs', b => {
    utilisateursQueryModify(
      b as QueryBuilder<Utilisateurs, Utilisateurs | Utilisateurs[]>,
      user
    )
  })

  return q
}

const administrationsLocalesModify = (
  q: QueryBuilder<
    AdministrationsModel,
    AdministrationsModel | AdministrationsModel[]
  >,
  administrationId: AdministrationId,
  titreAlias: string
) => {
  q.joinRaw(
    `left join titres_etapes as t_e on t_e.id = "${titreAlias}"."props_titre_etapes_ids" ->> 'points' and t_e.administrations_locales @> '"${administrationId}"'::jsonb`
  )
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

  if (isLocale) {
    q.modify(administrationsLocalesModify, administrationId, titreAlias)
  }

  q.where(c => {
    if (isGestionnaire || isAssociee) {
      const titreTypeIds: TitreTypeId[] = getTitreTypeIdsByAdministration(
        administrationId
      )
        .filter(att => {
          if (isGestionnaire && att.gestionnaire) {
            return true
          }
          if (isAssociee && att.associee) {
            return true
          }

          return false
        })
        .map(({ titreTypeId }) => titreTypeId)

      if (titreTypeIds.length) {
        c.orWhereRaw(`?? in (${titreTypeIds.map(t => `'${t}'`).join(',')})`, [
          `${titreAlias}.typeId`
        ])
      } else {
        c.orWhereRaw('false')
      }
    }

    if (isLocale) {
      c.orWhereNotNull('t_e.administrations_locales')
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
      knex.raw('?? = ??', [
        'a_tt_ts.titreStatutId',
        `${titreAlias}.titreStatutId`
      ])
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
  administrationsActivitesModify
}
