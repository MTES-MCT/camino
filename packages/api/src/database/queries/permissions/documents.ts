import { QueryBuilder, raw } from 'objection'

import Documents from '../../models/documents.js'
import ActivitesTypesDocumentsTypes from '../../models/activites-types--documents-types.js'
import { isBureauDEtudes, isDefault, isEntreprise, User } from 'camino-common/src/roles.js'
import TitresEtapes from '../../models/titres-etapes.js'

export const documentsQueryModify = (q: QueryBuilder<Documents, Documents | Documents[]>, user: User) => {
  q.select('documents.*')

  q.joinRelated('type')

  if (isEntreprise(user) || isBureauDEtudes(user)) {
    // repertoire = etapes
    q.leftJoinRelated('etape.demarche.titre.[titulaires, amodiataires]')

    // repertoire = activites
    q.leftJoinRelated('activite.titre.[titulaires, amodiataires]')
  }

  if (isDefault(user) || isEntreprise(user) || isBureauDEtudes(user)) {
    q.where(b => {
      b.orWhere('documents.publicLecture', true)

      // autorise à voir les docs temporaires
      b.orWhere(c => {
        c.whereNull('documents.titreEtapeId')
        c.whereNull('documents.titreActiviteId')
      })

      if (isEntreprise(user) || isBureauDEtudes(user)) {
        b.orWhere(c => {
          c.where('documents.entreprisesLecture', true)

          // si l'utilisateur est `entreprise`,
          // titres dont il est titulaire ou amodiataire
          const entreprisesIds = user.entreprises.map(e => e.id) ?? []

          c.where(d => {
            d.orWhere(e => {
              e.orWhereIn('etape:demarche:titre:titulaires.id', entreprisesIds)
              e.orWhereIn('etape:demarche:titre:amodiataires.id', entreprisesIds)
            })

            d.orWhere(e => {
              e.orWhereIn('activite:titre:titulaires.id', entreprisesIds)
              e.orWhereIn('activite:titre:amodiataires.id', entreprisesIds)
            })
          })
        })
      }
    })
  }

  q.select(raw('(not exists(?) and not exists(?))', [documentTypeActiviteTypeQuery('documents.typeId', 'documents.titreActiviteId'), etapeStatutNotAco()]).as('suppression'))
}
const etapeStatutNotAco = () => TitresEtapes.query().whereRaw('?? = ??', ['id', 'documents.titreEtapeId']).andWhereRaw('?? != ?', ['titresEtapes.statutId', 'aco'])

const documentTypeActiviteTypeQuery = (typeIdAlias: string, activiteIdAlias: string) =>
  ActivitesTypesDocumentsTypes.query()
    .leftJoin('titresActivites', 'titresActivites.id', activiteIdAlias)
    .whereRaw('?? = ??', ['activiteTypeId', 'titresActivites.typeId'])
    .andWhereRaw('?? = ??', ['documentTypeId', typeIdAlias])
    .andWhereRaw('?? is not true', ['optionnel'])
    .andWhereRaw('?? not in (?, ?)', ['titresActivites.activiteStatutId', 'abs', 'enc'])
