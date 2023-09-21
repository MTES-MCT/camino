import { raw, QueryBuilder } from 'objection'

import { knex } from '../../../knex.js'

import AdministrationsModel from '../../models/administrations.js'
import Utilisateurs from '../../models/utilisateurs.js'
import { utilisateursQueryModify } from './utilisateurs.js'
import { isSuper, User } from 'camino-common/src/roles.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { getTitreTypeIdsByAdministration } from 'camino-common/src/static/administrationsTitresTypes.js'
import { getAdministrationTitresTypesEtapesTypes } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getAdministrationTitresTypesTitresStatuts } from 'camino-common/src/static/administrationsTitresTypesTitresStatuts.js'

const administrationsQueryModify = (
  q: QueryBuilder<AdministrationsModel, AdministrationsModel | AdministrationsModel[]>,
  user: User
): QueryBuilder<AdministrationsModel, AdministrationsModel | AdministrationsModel[]> => {
  q.select('administrations.*')

  if (isSuper(user)) {
    q.select(raw('true').as('modification'))
  }

  q.modifyGraph('utilisateurs', b => {
    utilisateursQueryModify(b as QueryBuilder<Utilisateurs, Utilisateurs | Utilisateurs[]>, user)
  })

  return q
}

const administrationsLocalesModify = (q: QueryBuilder<AdministrationsModel, AdministrationsModel | AdministrationsModel[]>, administrationId: AdministrationId, titreAlias: string) => {
  q.joinRaw(`left join titres_etapes as t_e on t_e.id = "${titreAlias}"."props_titre_etapes_ids" ->> 'points' and t_e.administrations_locales @> '"${administrationId}"'::jsonb`)
}

const administrationsTitresQuery = (
  administrationId: AdministrationId,
  titreAlias: string,
  { isGestionnaire, isAssociee, isLocale }: { isGestionnaire?: boolean; isAssociee?: boolean; isLocale?: boolean } = {}
) => {
  const q = AdministrationsModel.query().where('administrations.id', administrationId)

  if (isLocale) {
    q.modify(administrationsLocalesModify, administrationId, titreAlias)
  }

  q.where(c => {
    if (isGestionnaire || isAssociee) {
      const titreTypeIds: TitreTypeId[] = getTitreTypeIdsByAdministration(administrationId)
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
        c.orWhereRaw(`?? in (${titreTypeIds.map(t => `'${t}'`).join(',')})`, [`${titreAlias}.typeId`])
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
  q: QueryBuilder<AdministrationsModel, AdministrationsModel | AdministrationsModel[]>,
  type: 'titres' | 'demarches' | 'etapes',
  titreAlias: string,
  administrationId: AdministrationId,
  conditionsAdd?: (b: QueryBuilder<AdministrationsModel, AdministrationsModel | AdministrationsModel[]>) => void
) => {
  const restrictions = getAdministrationTitresTypesTitresStatuts(administrationId).filter(r => r[`${type}ModificationInterdit`])

  q.where(p => {
    if (restrictions.length) {
      p.orWhereNot(b =>
        restrictions.forEach(r => b.orWhere(c => c.where(knex.raw('?? = ?', [`${titreAlias}.typeId`, r.titreTypeId])).where(knex.raw('?? = ?', [`${titreAlias}.titreStatutId`, r.titreStatutId]))))
      )
    }
    if (conditionsAdd) {
      conditionsAdd(p)
    }
  })
}

// l'utilisateur est dans au moins une administration
// qui n'a pas de restriction 'creationInterdit' sur ce type d'étape / type de titre
const administrationsTitresTypesEtapesTypesModify = (
  q: QueryBuilder<AdministrationsModel, AdministrationsModel | AdministrationsModel[]>,
  type: 'lecture' | 'modification' | 'creation',
  titreTypeIdColumn: string,
  etapeTypeIdColumn: string,
  administrationId: AdministrationId
) => {
  const restrictions = getAdministrationTitresTypesEtapesTypes(administrationId).filter(r => r[`${type}Interdit`])

  if (restrictions.length) {
    q.whereNot(b => restrictions.forEach(r => b.orWhere(c => c.where(knex.raw('?? = ?', [titreTypeIdColumn, r.titreTypeId])).where(knex.raw('?? = ?', [etapeTypeIdColumn, r.etapeTypeId])))))
  }
}

export { administrationsQueryModify, administrationsLocalesModify, administrationsTitresTypesTitresStatutsModify, administrationsTitresTypesEtapesTypesModify, administrationsTitresQuery }
