import { QueryBuilder, raw } from 'objection'

import Documents from '../../models/documents.js'
import { isBureauDEtudes, isDefault, isEntreprise, User } from 'camino-common/src/roles.js'
import TitresEtapes from '../../models/titres-etapes.js'

export const documentsQueryModify = (q: QueryBuilder<Documents, Documents | Documents[]>, user: User) => {
  q.select('documents.*')

  if (isEntreprise(user) || isBureauDEtudes(user)) {
    // repertoire = etapes
    q.leftJoinRelated('etape.demarche.titre.[titulaires, amodiataires]')
  }

  if (isDefault(user) || isEntreprise(user) || isBureauDEtudes(user)) {
    q.where(b => {
      b.orWhere('documents.publicLecture', true)

      // autorise à voir les docs temporaires
      b.orWhereNull('documents.titreEtapeId')

      if (isEntreprise(user) || isBureauDEtudes(user)) {
        b.orWhere(c => {
          c.where('documents.entreprisesLecture', true)

          // si l'utilisateur est `entreprise`,
          // titres dont il est titulaire ou amodiataire
          const entreprisesIds = user.entreprises.map(e => e.id) ?? []

          c.where(d => {
            d.orWhereIn('etape:demarche:titre:titulaires.id', entreprisesIds)
            d.orWhereIn('etape:demarche:titre:amodiataires.id', entreprisesIds)
          })
        })
      }
    })
  }

  q.select(raw('(not exists(?))', [etapeStatutNotAco()]).as('suppression'))
}
const etapeStatutNotAco = () => TitresEtapes.query().whereRaw('?? = ??', ['id', 'documents.titreEtapeId']).andWhereRaw('?? != ?', ['titresEtapes.statutId', 'aco'])
