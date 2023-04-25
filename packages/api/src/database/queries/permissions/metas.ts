import { raw } from 'objection'

import { knex } from '../../../knex.js'

import TitresEtapes from '../../models/titres-etapes.js'
import TitresTypesDemarchesTypesEtapesTypes from '../../models/titres-types--demarches-types-etapes-types.js'

import { administrationsTitresTypesTitresStatutsModify, administrationsTitresTypesEtapesTypesModify, administrationsTitresQuery } from './administrations.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { TITRES_TYPES_IDS_DEMAT } from 'camino-common/src/permissions/titres.js'

// récupère les types d'étapes qui ont
// - les autorisations sur le titre
// - pas de restrictions sur le type d'étape
// -> retourne un booléen pour chaque ligne contenant :
// - 'titresModification.id': id du titre sur lequel l'utilisateur a des droits
// - 'demarchesModification.id': id de la démarche
// - 't_d_e.etapeTypeId': id du type d'étape'
export const administrationsEtapesTypesPropsQuery = (administrationId: AdministrationId, type: 'modification' | 'creation') =>
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
        .modify(administrationsTitresTypesTitresStatutsModify, 'etapes', 'titresModification', administrationId)
        .modify(administrationsTitresTypesEtapesTypesModify, type, 't_d_e.titreTypeId', 't_d_e.etapeTypeId', administrationId)
    )

export const entreprisesEtapesTypesPropsQuery = (entreprisesIds: string[]) =>
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
