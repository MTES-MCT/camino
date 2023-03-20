import { raw, QueryBuilder } from 'objection'

import { knex } from '../../../knex.js'

import EtapesTypes from '../../models/etapes-types.js'
import TitresEtapes from '../../models/titres-etapes.js'
import TitresTypesDemarchesTypesEtapesTypes from '../../models/titres-types--demarches-types-etapes-types.js'

import { administrationsTitresTypesTitresStatutsModify, administrationsTitresTypesEtapesTypesModify, administrationsTitresQuery } from './administrations.js'
import { isBureauDEtudes, isDefault, isEntreprise, User } from 'camino-common/src/roles.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { TITRES_TYPES_IDS_DEMAT } from 'camino-common/src/permissions/titres.js'

// récupère les types d'étapes qui ont
// - les autorisations sur le titre
// - pas de restrictions sur le type d'étape
// -> retourne un booléen pour chaque ligne contenant :
// - 'titresModification.id': id du titre sur lequel l'utilisateur a des droits
// - 'demarchesModification.id': id de la démarche
// - 't_d_e.etapeTypeId': id du type d'étape'
const administrationsEtapesTypesPropsQuery = (administrationId: AdministrationId, type: 'modification' | 'creation') =>
  TitresTypesDemarchesTypesEtapesTypes.query()
    .alias('t_d_e')
    .select(raw('true'))
    .leftJoin('titres as titresModification', raw('?? = ??', ['t_d_e.titreTypeId', 'titresModification.typeId']))
    .leftJoin('titresDemarches as demarchesModification', b => {
      b.on(knex.raw('?? = ??', ['demarchesModification.typeId', 't_d_e.demarcheTypeId'])).andOn(knex.raw('?? = ??', ['demarchesModification.titreId', 'titresModification.id']))
    })
    .whereExists(
      administrationsTitresQuery(administrationId, 'titres_modification', {
        isGestionnaire: true,
        isLocale: true,
      })
        .modify(administrationsTitresTypesTitresStatutsModify, 'etapes', 'titresModification')
        .modify(administrationsTitresTypesEtapesTypesModify, type, 't_d_e.titreTypeId', 't_d_e.etapeTypeId')
    )

const entreprisesEtapesTypesPropsQuery = (entreprisesIds: string[]) =>
  TitresEtapes.query()
    .alias('e_te')
    .select(raw('true'))
    .leftJoinRelated('titulaires')
    .leftJoinRelated('demarche.titre')
    .andWhere('demarche.typeId', 'oct')
    .andWhere('e_te.typeId', 'mfr')
    .andWhere('e_te.statutId', 'aco')
    .whereIn('demarche:titre.typeId', TITRES_TYPES_IDS_DEMAT)
    .whereIn('titulaires.id', entreprisesIds)
    .first()

const etapesTypesQueryModify = (
  q: QueryBuilder<EtapesTypes, EtapesTypes | EtapesTypes[]>,
  user: User,
  {
    titreDemarcheId,
    titreEtapeId,
    uniqueCheck,
  }: {
    titreDemarcheId?: string
    titreEtapeId?: string
    uniqueCheck?: boolean
  } = { uniqueCheck: true }
) => {
  q.select('etapesTypes.*')

  // si titreDemarcheId
  // -> restreint aux types d'étapes du type de la démarche

  if (titreDemarcheId) {
    q.leftJoin('titresDemarches as td', raw('?? = ?', ['td.id', titreDemarcheId]))
    q.leftJoin('titres as t', 't.id', 'td.titreId')
    q.leftJoin('titresTypes__demarchesTypes__etapesTypes as tde', b => {
      b.on(knex.raw('?? = ??', ['tde.etapeTypeId', 'etapesTypes.id']))
      b.andOn(knex.raw('?? = ??', ['tde.demarcheTypeId', 'td.typeId']))
      b.andOn(knex.raw('?? = ??', ['tde.titreTypeId', 't.typeId']))
    })

    q.andWhereRaw('?? is not null', ['tde.titre_type_id'])
    q.orderBy('tde.ordre')

    // si
    // - l'étape n'est pas unique
    // - ou si
    //   - il n'y a aucune étape du même type au sein de la démarche
    //   - l'id de l'étape est différente de l'étape éditée
    // -> affiche le type d'étape
    if (uniqueCheck) {
      q.where(b => {
        b.whereRaw('?? is not true', ['etapesTypes.unique'])
        b.orWhere(c => {
          const d = TitresEtapes.query().where({ titreDemarcheId }).where('archive', false).whereRaw('?? = ??', ['typeId', 'etapesTypes.id'])

          if (titreEtapeId) {
            d.whereNot('id', titreEtapeId)
          }

          c.whereNotExists(d)
        })
      })
    }
  }

  // types d'étapes visibles pour les entreprises et utilisateurs déconnectés ou défaut
  if (isDefault(user) || isEntreprise(user) || isBureauDEtudes(user)) {
    q.where(b => {
      // types d'étapes visibles en tant que titulaire ou amodiataire
      if (isEntreprise(user) || isBureauDEtudes(user)) {
        b.orWhere('td.entreprisesLecture', true)
      }

      // types d'étapes publiques
      b.orWhere('td.publicLecture', true)
    })
  }
}

export { administrationsEtapesTypesPropsQuery, entreprisesEtapesTypesPropsQuery, etapesTypesQueryModify }
