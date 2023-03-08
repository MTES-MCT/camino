import { raw, QueryBuilder } from 'objection'

import Documents from '../../models/documents.js'
import TitresEtapes from '../../models/titres-etapes.js'
import Entreprises from '../../models/entreprises.js'

import { documentsQueryModify } from './documents.js'
import { administrationsEtapesTypesPropsQuery, entreprisesEtapesTypesPropsQuery } from './metas.js'
import { administrationsTitresTypesEtapesTypesModify, administrationsTitresQuery } from './administrations.js'
import { entreprisesQueryModify, entreprisesTitresQuery } from './entreprises.js'
import { titresDemarchesQueryModify } from './titres-demarches.js'
import TitresDemarches from '../../models/titres-demarches.js'
import Journaux from '../../models/journaux.js'
import { journauxQueryModify } from './journaux.js'
import { isAdministration, isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, isSuper, User } from 'camino-common/src/roles.js'

const titreEtapeModificationQueryBuild = (user: User) => {
  if (isSuper(user)) {
    return raw('true')
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return administrationsEtapesTypesPropsQuery(user.administrationId, 'modification')
      .whereRaw('?? = ??', ['demarchesModification.id', 'titresEtapes.titreDemarcheId'])
      .whereRaw('?? = ??', ['t_d_e.etapeTypeId', 'titresEtapes.typeId'])
  } else if ((isEntreprise(user) || isBureauDEtudes(user)) && user.entreprises?.length) {
    return entreprisesEtapesTypesPropsQuery(user.entreprises.map(({ id }) => id)).whereRaw('?? = ??', ['titresEtapes.id', 'e_te.id'])
  }

  return raw('false')
}

const specifiquesAdd = (q: QueryBuilder<TitresEtapes, TitresEtapes | TitresEtapes[]>) => {
  // sections spécifiques
  q.leftJoin('titresTypes__demarchesTypes__etapesTypes as tde', b => {
    b.andOn('tde.titreTypeId', 'demarche:titre.typeId')
    b.andOn('tde.demarcheTypeId', 'demarche.typeId')
    b.andOn('tde.etapeTypeId', 'type.id')
  })
  q.select(raw('tde.sections').as('sectionsSpecifiques'))
  q.groupBy('tde.sections')

  // justificatifs spécifiques
  q.leftJoin('titresTypes__demarchesTypes__etapesTypes__justificatifsT as tdef', b => {
    b.andOn('tdef.titreTypeId', 'demarche:titre.typeId')
    b.andOn('tdef.demarcheTypeId', 'demarche.typeId')
    b.andOn('tdef.etapeTypeId', 'type.id')
  })
  q.leftJoin('documentsTypes as dt2', 'dt2.id', 'tdef.documentTypeId')
  q.select(
    raw("COALESCE(json_agg(json_build_object('id', dt2.id,'nom', dt2.nom, 'optionnel', tdef.optionnel, 'description', tdef.description)) FILTER (WHERE dt2.id IS NOT NULL), '[]')").as(
      'justificatifsTypesSpecifiques'
    )
  )
  q.groupBy('titresEtapes.id')

  return q
}

/**
 * Modifie la requête d'étape(s) pour prendre en compte les permissions de l'utilisateur connecté
 *
 * @params q - requête d'étape(s)
 * @params user - utilisateur connecté
 * @returns une requête d'étape(s)
 */
export const titresEtapesQueryModify = (q: QueryBuilder<TitresEtapes, TitresEtapes | TitresEtapes[]>, user: User) => {
  q.select('titresEtapes.*').where('titresEtapes.archive', false).leftJoinRelated('[demarche.titre, type]')

  q = specifiquesAdd(q)

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
          }).modify(administrationsTitresTypesEtapesTypesModify, 'lecture', 'demarche:titre.typeId', 'titresEtapes.typeId')
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

  // TODO 2023-02-28 TDE à supprimer pour pouvoir supprimer TDE de la bdd, mais nécessite de revoir l’héritage cf 2023-02-28 TDE
  q.select(titreEtapeModificationQueryBuild(user).as('modification'))

  q.modifyGraph('demarche', b => {
    titresDemarchesQueryModify(b as QueryBuilder<TitresDemarches, TitresDemarches | TitresDemarches[]>, user)
  })

  q.modifyGraph('documents', b => {
    documentsQueryModify(b as QueryBuilder<Documents, Documents | Documents[]>, user)
  })

  q.modifyGraph('justificatifs', b => {
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
