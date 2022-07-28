import { raw } from 'objection'

import {
  IFields,
  IDocumentRepertoire,
  ITitreTypeType,
  ITitreStatut,
  IDemarcheType,
  IDemarcheStatut,
  IPhaseStatut,
  IEtapeType,
  IDocumentType,
  IReferenceType,
  ITitreType,
  ITitreTypeTitreStatut,
  ITitreTypeDemarcheType,
  ITitreTypeDemarcheTypeEtapeType,
  IUtilisateur,
  IEtapeTypeDocumentType,
  IEtapeTypeJustificatifType,
  ITitreTypeDemarcheTypeEtapeTypeDocumentType,
  ITitreTypeDemarcheTypeEtapeTypeJustificatifType
} from '../../types'

import { knex } from '../../knex'

import options from './_options'
import graphBuild from './graph/build'
import { fieldsFormat } from './graph/fields-format'

import DemarchesTypes from '../models/demarches-types'
import DocumentsTypes from '../models/documents-types'
import DemarchesStatuts from '../models/demarches-statuts'
import Domaines from '../models/domaines'
import EtapesTypes from '../models/etapes-types'
import ReferencesTypes from '../models/references-types'
import TitresStatuts from '../models/titres-statuts'
import TitresTypesTypes from '../models/titres-types-types'
import SubstancesLegalesCodes from '../models/substances-legales-codes'

import {
  domainesQueryModify,
  etapesTypesQueryModify,
  demarchesTypesQueryModify
} from './permissions/metas'

import PhasesStatuts from '../models/phases-statuts'
import TitresTypes from '../models/titres-types'
import TitresTypesTitresStatuts from '../models/titres-types--titres-statuts'
import TitresTypesDemarchesTypesEtapesTypes from '../models/titres-types--demarches-types-etapes-types'
import TitresTypesDemarchesTypes from '../models/titres-types--demarches-types'
import EtapesTypesDocumentsTypes from '../models/etapes-types--documents-types'
import EtapesTypesJustificatifsTypes from '../models/etapes-types--justificatifs-types'
import TitresTypesDemarchesTypesEtapesTypesDocumentsTypes from '../models/titres-types--demarches-types-etapes-types-documents-types'
import TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes from '../models/titres-types--demarches-types-etapes-types-justificatifs-types'
import Titres from '../models/titres'
import { sortedDevises } from 'camino-common/src/static/devise'

const documentTypeCreate = async (documentType: IDocumentType) =>
  DocumentsTypes.query().insertGraphAndFetch(documentType)

const documentTypeUpdate = async (id: string, props: Partial<IDocumentType>) =>
  DocumentsTypes.query().patchAndFetchById(id, props)

const referenceTypeUpdate = async (
  id: string,
  props: Partial<IReferenceType>
) => ReferencesTypes.query().patchAndFetchById(id, props)

const titresTypesTypesGet = async () =>
  TitresTypesTypes.query().orderBy('ordre')

const titreTypeTypeUpdate = async (
  id: string,
  props: Partial<ITitreTypeType>
) => TitresTypesTypes.query().patchAndFetchById(id, props)

const domainesGet = async (
  _: never,
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const graph = fields
    ? graphBuild(fields, 'titre', fieldsFormat)
    : options.domaines.graph

  const q = Domaines.query().withGraphFetched(graph).orderBy('ordre')

  domainesQueryModify(q, user)

  return q
}

const domaineGet = async (
  id: string,
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const graph = fields
    ? graphBuild(fields, 'titre', fieldsFormat)
    : options.domaines.graph

  const q = Domaines.query().withGraphFetched(graph).findById(id)

  domainesQueryModify(q, user)

  return q
}

const titresTypesGet = async (_: never, { fields }: { fields?: IFields }) => {
  const graph = fields
    ? graphBuild(fields, 'titresTypes', fieldsFormat)
    : options.titresTypes.graph

  return TitresTypes.query().withGraphFetched(graph).orderBy('id')
}

const titreTypeGet = async (id: string) => TitresTypes.query().findById(id)

const titreTypeUpdate = async (id: string, props: Partial<ITitreType>) =>
  TitresTypes.query().patchAndFetchById(id, props)

const titreTypeCreate = async (titreType: ITitreType) =>
  TitresTypes.query().insertAndFetch(titreType)

const titreTypeDelete = async (id: string) => TitresTypes.query().deleteById(id)

const titresTypesTitresStatutsGet = async () =>
  TitresTypesTitresStatuts.query().orderBy(['titreTypeId', 'titreStatutId'])

const titreTypeTitreStatutUpdate = async (
  titreTypeId: string,
  titreStatutId: string,
  props: Partial<ITitreTypeTitreStatut>
) =>
  TitresTypesTitresStatuts.query().patchAndFetchById(
    [titreTypeId, titreStatutId],
    props
  )

const titreTypeTitreStatutCreate = async (
  titreTypeTitreStatut: ITitreTypeTitreStatut
) => TitresTypesTitresStatuts.query().insertAndFetch(titreTypeTitreStatut)

const titreTypeTitreStatutDelete = async (
  titreTypeId: string,
  titreStatutId: string
) => TitresTypesTitresStatuts.query().deleteById([titreTypeId, titreStatutId])

const titresTypesDemarchesTypesGet = async () =>
  TitresTypesDemarchesTypes.query().orderBy(['titreTypeId', 'demarcheTypeId'])

const titreTypeDemarcheTypeUpdate = async (
  titreTypeId: string,
  demarcheTypeId: string,
  props: Partial<ITitreTypeDemarcheType>
) =>
  TitresTypesDemarchesTypes.query().patchAndFetchById(
    [titreTypeId, demarcheTypeId],
    props
  )

const titreTypeDemarcheTypeCreate = async (
  titreTypeDemarcheType: ITitreTypeDemarcheType
) => TitresTypesDemarchesTypes.query().insertAndFetch(titreTypeDemarcheType)

const titreTypeDemarcheTypeDelete = async (
  titreTypeId: string,
  demarcheTypeId: string
) => TitresTypesDemarchesTypes.query().deleteById([titreTypeId, demarcheTypeId])

const titresTypesDemarchesTypesEtapesTypesGet = async () =>
  TitresTypesDemarchesTypesEtapesTypes.query().orderBy([
    'titreTypeId',
    'demarcheTypeId',
    'etapeTypeId'
  ])

const titreTypeDemarcheTypeEtapeTypeGet = async (
  {
    titreTypeId,
    demarcheTypeId,
    etapeTypeId
  }: {
    titreTypeId: string
    demarcheTypeId: string
    etapeTypeId: string
  },
  { fields }: { fields?: IFields }
) => {
  const graph = fields
    ? graphBuild(fields, 'titresTypesDemarchesTypesEtapesTypes', fieldsFormat)
    : []

  return TitresTypesDemarchesTypesEtapesTypes.query()
    .findById([titreTypeId, demarcheTypeId, etapeTypeId])
    .withGraphFetched(graph)
}

const titreTypeDemarcheTypeEtapeTypeUpdate = async (
  titreTypeId: string,
  demarcheTypeId: string,
  etapeTypeId: string,
  titreTypeDemarcheTypeEtapeType: Partial<ITitreTypeDemarcheTypeEtapeType>
) =>
  TitresTypesDemarchesTypesEtapesTypes.query()
    .patch(titreTypeDemarcheTypeEtapeType)
    .findById([titreTypeId, demarcheTypeId, etapeTypeId])

const titreTypeDemarcheTypeEtapeTypeCreate = async (
  titreTypeDemarcheTypeEtapeType: ITitreTypeDemarcheTypeEtapeType
) =>
  TitresTypesDemarchesTypesEtapesTypes.query().insertAndFetch(
    titreTypeDemarcheTypeEtapeType
  )

const titreTypeDemarcheTypeEtapeTypeDelete = async (
  titreTypeId: string,
  demarcheTypeId: string,
  etapeTypeId: string
) =>
  TitresTypesDemarchesTypesEtapesTypes.query().deleteById([
    titreTypeId,
    demarcheTypeId,
    etapeTypeId
  ])

const titresTypesDemarchesTypesEtapesTypesDocumentsTypesGet = async () =>
  TitresTypesDemarchesTypesEtapesTypesDocumentsTypes.query().orderBy([
    'titreTypeId',
    'demarcheTypeId',
    'etapeTypeId',
    'documentTypeId'
  ])

const titreTypeDemarcheTypeEtapeTypeDocumentTypeUpdate = async (
  titreTypeId: string,
  demarcheTypeId: string,
  etapeTypeId: string,
  documentTypeId: string,
  titreTypeDemarcheTypeEtapeTypeDocumentType: Partial<ITitreTypeDemarcheTypeEtapeTypeDocumentType>
) =>
  TitresTypesDemarchesTypesEtapesTypesDocumentsTypes.query()
    .patch(titreTypeDemarcheTypeEtapeTypeDocumentType)
    .findById([titreTypeId, demarcheTypeId, etapeTypeId, documentTypeId])

const titreTypeDemarcheTypeEtapeTypeDocumentTypeCreate = async (
  titreTypeDemarcheTypeEtapeTypeDocumentType: ITitreTypeDemarcheTypeEtapeTypeDocumentType
) =>
  TitresTypesDemarchesTypesEtapesTypesDocumentsTypes.query().insertAndFetch(
    titreTypeDemarcheTypeEtapeTypeDocumentType
  )

const titreTypeDemarcheTypeEtapeTypeDocumentTypeDelete = async (
  titreTypeId: string,
  demarcheTypeId: string,
  etapeTypeId: string,
  documentTypeId: string
) =>
  TitresTypesDemarchesTypesEtapesTypesDocumentsTypes.query().deleteById([
    titreTypeId,
    demarcheTypeId,
    etapeTypeId,
    documentTypeId
  ])

const titresTypesDemarchesTypesEtapesTypesJustificatifsTypesGet = async () =>
  TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes.query().orderBy([
    'titreTypeId',
    'demarcheTypeId',
    'etapeTypeId',
    'documentTypeId'
  ])

const titreTypeDemarcheTypeEtapeTypeJustificatifTypeUpdate = async (
  titreTypeId: string,
  demarcheTypeId: string,
  etapeTypeId: string,
  documentTypeId: string,
  titreTypeDemarcheTypeEtapeTypeJustificatifType: Partial<ITitreTypeDemarcheTypeEtapeTypeJustificatifType>
) =>
  TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes.query()
    .patch(titreTypeDemarcheTypeEtapeTypeJustificatifType)
    .findById([titreTypeId, demarcheTypeId, etapeTypeId, documentTypeId])

const titreTypeDemarcheTypeEtapeTypeJustificatifTypeCreate = async (
  titreTypeDemarcheTypeEtapeTypeJustificatifType: ITitreTypeDemarcheTypeEtapeTypeJustificatifType
) =>
  TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes.query().insertAndFetch(
    titreTypeDemarcheTypeEtapeTypeJustificatifType
  )

const titreTypeDemarcheTypeEtapeTypeJustificatifTypeDelete = async (
  titreTypeId: string,
  demarcheTypeId: string,
  etapeTypeId: string,
  documentTypeId: string
) =>
  TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes.query().deleteById([
    titreTypeId,
    demarcheTypeId,
    etapeTypeId,
    documentTypeId
  ])

const etapesTypesDocumentsTypesGet = async () =>
  EtapesTypesDocumentsTypes.query().orderBy(['etapeTypeId', 'documentTypeId'])

const etapeTypeDocumentTypeUpdate = async (
  etapeTypeId: string,
  documentTypeId: string,
  props: Partial<IEtapeTypeDocumentType>
) =>
  EtapesTypesDocumentsTypes.query().patchAndFetchById(
    [etapeTypeId, documentTypeId],
    props
  )

const etapeTypeDocumentTypeCreate = async (
  etapeTypeDocumentType: IEtapeTypeDocumentType
) => EtapesTypesDocumentsTypes.query().insert(etapeTypeDocumentType)

const etapeTypeDocumentTypeDelete = async (
  etapeTypeId: string,
  documentTypeId: string
) => EtapesTypesDocumentsTypes.query().deleteById([etapeTypeId, documentTypeId])

const etapesTypesJustificatifsTypesGet = async () =>
  EtapesTypesJustificatifsTypes.query().orderBy([
    'etapeTypeId',
    'documentTypeId'
  ])

const etapeTypeJustificatifTypeUpdate = async (
  etapeTypeId: string,
  documentTypeId: string,
  props: Partial<IEtapeTypeJustificatifType>
) =>
  EtapesTypesJustificatifsTypes.query().patchAndFetchById(
    [etapeTypeId, documentTypeId],
    props
  )

const etapeTypeJustificatifTypeCreate = async (
  etapeTypeJustificatifType: IEtapeTypeJustificatifType
) => EtapesTypesJustificatifsTypes.query().insert(etapeTypeJustificatifType)

const etapeTypeJustificatifTypeDelete = async (
  etapeTypeId: string,
  documentTypeId: string
) =>
  EtapesTypesJustificatifsTypes.query().deleteById([
    etapeTypeId,
    documentTypeId
  ])

/**
 * retourne les statuts de titre visible par l’utilisateur
 * @param user - utilisateur
 * @returns liste de statuts
 */
const titresStatutsGet = async (user: IUtilisateur | null | undefined) => {
  let query = TitresStatuts.query().orderBy('ordre')

  // si l’utilisateur n’est pas connecté on filtre les statuts non visibles pour le public
  if (!user) {
    query = query.whereIn(
      'id',
      TitresTypesTitresStatuts.query()
        .distinct('titreStatutId')
        .where('publicLecture', true)
    )
  }

  return query
}

const titreStatutUpdate = async (id: string, props: Partial<ITitreStatut>) =>
  TitresStatuts.query().patchAndFetchById(id, props)

const demarchesTypesGet = async (
  { titreId, travaux }: { titreId?: string; travaux?: boolean },
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const graph = fields
    ? graphBuild(fields, 'demarchesTypes', fieldsFormat)
    : options.demarchesTypes.graph

  const q = DemarchesTypes.query().withGraphFetched(graph).orderBy('ordre')

  // si titreId
  // -> restreint aux types de démarches du type du titre
  if (titreId) {
    q.whereExists(
      Titres.query()
        .findById(titreId)
        .joinRelated('type.demarchesTypes')
        .whereRaw('?? = ??', ['type:demarchesTypes.id', 'demarchesTypes.id'])
    )
  }

  if (travaux === false || travaux === true) {
    if (travaux) {
      q.where('demarchesTypes.travaux', travaux)
    } else {
      q.whereRaw('?? is not true', ['demarchesTypes.travaux'])
    }
  }

  demarchesTypesQueryModify(q, user, { titreId })

  return q
}

const demarcheTypeGet = async (
  id: string,
  { titreId }: { titreId: string },
  user: IUtilisateur | null | undefined
) => {
  const q = DemarchesTypes.query()
  demarchesTypesQueryModify(q, user, { titreId })

  return q.findById(id)
}

const demarcheTypeUpdate = async (id: string, props: Partial<IDemarcheType>) =>
  DemarchesTypes.query().patchAndFetchById(id, props)

const demarchesStatutsGet = async () =>
  DemarchesStatuts.query().orderBy('ordre')

const demarcheStatutUpdate = async (
  id: string,
  props: Partial<IDemarcheStatut>
) => DemarchesStatuts.query().patchAndFetchById(id, props)

const phasesStatutsGet = async () => PhasesStatuts.query().orderBy('id')

const phaseStatutUpdate = async (id: string, props: Partial<IPhaseStatut>) =>
  PhasesStatuts.query().patchAndFetchById(id, props).orderBy('id')

const etapesTypesGet = async (
  {
    titreDemarcheId,
    titreEtapeId,
    travaux
  }: {
    titreDemarcheId?: string
    titreEtapeId?: string
    travaux?: boolean
  },
  { fields, uniqueCheck = true }: { fields?: IFields; uniqueCheck?: boolean },
  user: IUtilisateur | null | undefined
) => {
  const graph = fields ? graphBuild(fields, 'etapesTypes', fieldsFormat) : []

  const q = EtapesTypes.query().withGraphFetched(graph)

  if (titreDemarcheId) {
    etapesTypesQueryModify(q, user, {
      titreDemarcheId,
      titreEtapeId,
      uniqueCheck
    })
  } else {
    q.orderBy('ordre')
  }

  if (travaux === false || travaux === true) {
    const travauxQuery = TitresTypesDemarchesTypesEtapesTypes.query()
      .leftJoinRelated('demarcheType')
      .whereRaw('?? = ??', ['etapeTypeId', 'etapesTypes.id'])
    if (travaux) {
      travauxQuery.where('demarcheType.travaux', travaux)
    } else {
      travauxQuery.whereRaw('?? is not true', ['demarcheType.travaux'])
    }
    q.whereExists(travauxQuery)
  }

  return q
}

const etapeTypeGet = async (id: string, { fields }: { fields?: IFields }) => {
  const graph = fields ? graphBuild(fields, 'etapesTypes', fieldsFormat) : []

  return EtapesTypes.query().withGraphFetched(graph).findById(id)
}

const etapeTypeUpdate = async (id: string, props: Partial<IEtapeType>) =>
  EtapesTypes.query().patchAndFetchById(id, props)

const devisesGet = () => sortedDevises

const documentsTypesGet = async ({
  repertoire,
  typeId
}: {
  repertoire?: IDocumentRepertoire
  typeId?: string
}) => {
  const q = DocumentsTypes.query().orderBy('nom')

  q.select('documentsTypes.*')

  if (repertoire) {
    if (typeId && repertoire === 'activites') {
      q.join('activitesTypes__documentsTypes as at_dt', b => {
        b.on(knex.raw('?? = ?', ['at_dt.activiteTypeId', typeId]))
        b.on(knex.raw('?? = ??', ['at_dt.documentTypeId', 'documentsTypes.id']))
      })

      q.select(raw('?? is true', ['at_dt.optionnel']).as('optionnel'))
    } else if (typeId && repertoire === 'demarches') {
      q.join('etapesTypes__documentsTypes as et_dt', b => {
        b.on(knex.raw('?? = ?', ['et_dt.etapeTypeId', typeId]))
        b.on(knex.raw('?? = ??', ['et_dt.documentTypeId', 'documentsTypes.id']))
      })

      q.select(raw('?? is true', ['et_dt.optionnel']).as('optionnel'))
    } else if (repertoire === 'entreprises') {
      if (typeId) {
        q.join('etapesTypes__justificatifsTypes as et_jt', b => {
          b.on(knex.raw('?? = ?', ['et_jt.etapeTypeId', typeId]))
          b.on(
            knex.raw('?? = ??', ['et_jt.documentTypeId', 'documentsTypes.id'])
          )
        })
        q.select(raw('?? is true', ['et_jt.optionnel']).as('optionnel'))
      } else {
        q.join(
          'entreprises__documentsTypes as e_dt',
          'e_dt.documentTypeId',
          'documentsTypes.id'
        )
      }
    }
  }

  return q
}

const documentTypeGet = async (id: string) =>
  DocumentsTypes.query().findById(id)

const referencesTypesGet = async () => ReferencesTypes.query().orderBy('nom')

const substancesLegalesCodesGet = async () =>
  SubstancesLegalesCodes.query().orderBy('ordre')

export {
  domaineGet,
  domainesGet,
  titresTypesTypesGet,
  titreTypeTypeUpdate,
  titresTypesGet,
  titresStatutsGet,
  titreStatutUpdate,
  demarchesTypesGet,
  demarcheTypeGet,
  demarcheTypeUpdate,
  demarchesStatutsGet,
  demarcheStatutUpdate,
  etapesTypesGet,
  etapeTypeGet,
  etapeTypeUpdate,
  devisesGet,
  documentsTypesGet,
  documentTypeGet,
  referencesTypesGet,
  phasesStatutsGet,
  phaseStatutUpdate,
  substancesLegalesCodesGet,
  documentTypeCreate,
  documentTypeUpdate,
  referenceTypeUpdate,
  titreTypeGet,
  titreTypeUpdate,
  titreTypeCreate,
  titreTypeDelete,
  titresTypesTitresStatutsGet,
  titreTypeTitreStatutUpdate,
  titreTypeTitreStatutCreate,
  titreTypeTitreStatutDelete,
  titresTypesDemarchesTypesGet,
  titreTypeDemarcheTypeUpdate,
  titreTypeDemarcheTypeCreate,
  titreTypeDemarcheTypeDelete,
  titresTypesDemarchesTypesEtapesTypesGet,
  titreTypeDemarcheTypeEtapeTypeGet,
  titreTypeDemarcheTypeEtapeTypeUpdate,
  titreTypeDemarcheTypeEtapeTypeCreate,
  titreTypeDemarcheTypeEtapeTypeDelete,
  titresTypesDemarchesTypesEtapesTypesDocumentsTypesGet,
  titreTypeDemarcheTypeEtapeTypeDocumentTypeUpdate,
  titreTypeDemarcheTypeEtapeTypeDocumentTypeCreate,
  titreTypeDemarcheTypeEtapeTypeDocumentTypeDelete,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypesGet,
  titreTypeDemarcheTypeEtapeTypeJustificatifTypeUpdate,
  titreTypeDemarcheTypeEtapeTypeJustificatifTypeCreate,
  titreTypeDemarcheTypeEtapeTypeJustificatifTypeDelete,
  etapesTypesDocumentsTypesGet,
  etapeTypeDocumentTypeUpdate,
  etapeTypeDocumentTypeCreate,
  etapeTypeDocumentTypeDelete,
  etapesTypesJustificatifsTypesGet,
  etapeTypeJustificatifTypeUpdate,
  etapeTypeJustificatifTypeCreate,
  etapeTypeJustificatifTypeDelete
}
