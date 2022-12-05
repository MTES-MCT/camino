import { QueryBuilder, raw } from 'objection'

import { IUtilisateur } from '../../../types.js'

import Documents from '../../models/documents.js'
import TitresEtapesJustificatifs from '../../models/titres-etapes-justificatifs.js'
import ActivitesTypesDocumentsTypes from '../../models/activites-types--documents-types.js'
import {
  isBureauDEtudes,
  isDefault,
  isEntreprise
} from 'camino-common/src/roles.js'
import TitresEtapes from '../../models/titres-etapes.js'

const documentsQueryModify = (
  q: QueryBuilder<Documents, Documents | Documents[]>,
  user: IUtilisateur | null | undefined
) => {
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
        c.whereNull('documents.entrepriseId')
        c.whereNull('documents.titreEtapeId')
        c.whereNull('documents.titreActiviteId')
      })

      if (isEntreprise(user) || isBureauDEtudes(user)) {
        b.orWhere(c => {
          c.where('documents.entreprisesLecture', true)

          // si l'utilisateur est `entreprise`,
          // titres dont il est titulaire ou amodiataire
          // TODO 2022-06-29: Ceci ne devrait plus être nécessaire une fois la PR sur keycloak mergée
          const entreprisesIds = user.entreprises?.map(e => e.id) ?? []

          c.where(d => {
            d.orWhere(e => {
              e.orWhereIn('etape:demarche:titre:titulaires.id', entreprisesIds)
              e.orWhereIn(
                'etape:demarche:titre:amodiataires.id',
                entreprisesIds
              )
            })

            d.orWhere(e => {
              e.orWhereIn('activite:titre:titulaires.id', entreprisesIds)
              e.orWhereIn('activite:titre:amodiataires.id', entreprisesIds)
            })

            d.orWhereIn('documents.entrepriseId', entreprisesIds)
          })
        })
      }
    })
  }

  q.select(
    raw('(not exists(?))', [titreEtapeJustificatifsQuery]).as('modification')
  )
  q.select(
    raw('(not exists(?) and not exists(?) and not exists(?))', [
      titreEtapeJustificatifsQuery,
      documentTypeActiviteTypeQuery(
        'documents.typeId',
        'documents.titreActiviteId'
      ),
      etapeStatutNotAco()
    ]).as('suppression')
  )
}
const etapeStatutNotAco = () =>
  TitresEtapes.query()
    .whereRaw('?? = ??', ['id', 'documents.titreEtapeId'])
    .andWhereRaw('?? != ?', ['titresEtapes.statutId', 'aco'])

const titreEtapeJustificatifsQuery = TitresEtapesJustificatifs.query()
  .alias('documentsModification')
  .whereRaw('?? = ??', ['documentsModification.documentId', 'documents.id'])

const documentTypeActiviteTypeQuery = (
  typeIdAlias: string,
  activiteIdAlias: string
) =>
  ActivitesTypesDocumentsTypes.query()
    .leftJoin('titresActivites', 'titresActivites.id', activiteIdAlias)
    .whereRaw('?? = ??', ['activiteTypeId', 'titresActivites.typeId'])
    .andWhereRaw('?? = ??', ['documentTypeId', typeIdAlias])
    .andWhereRaw('?? is not true', ['optionnel'])
    .andWhereRaw('?? not in (?, ?)', ['titresActivites.statutId', 'abs', 'enc'])

const etapeTypeDocumentTypeUsedCheck = async (
  etapeTypeId: string,
  documentTypeId: string
) => {
  const res = await Documents.query()
    .joinRelated('etape')
    .where('etape.typeId', etapeTypeId)
    .andWhere('documents.typeId', documentTypeId)
    .resultSize()

  return res !== 0
}

const etapeTypeJustificatifTypeUsedCheck = async (
  etapeTypeId: string,
  documentTypeId: string
) => {
  const res = await TitresEtapesJustificatifs.query()
    .joinRelated('etape')
    .joinRelated('document')
    .where('etape.typeId', etapeTypeId)
    .andWhere('document.typeId', documentTypeId)
    .resultSize()

  return res !== 0
}

export {
  documentsQueryModify,
  etapeTypeDocumentTypeUsedCheck,
  etapeTypeJustificatifTypeUsedCheck
}
