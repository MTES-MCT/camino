import { raw } from 'objection'

import { IDocumentRepertoire, IFields, IUtilisateur } from '../../types'

import { knex } from '../../knex'

import options from './_options'
import graphBuild from './graph/build'
import { fieldsFormat } from './graph/fields-format'

import DemarchesTypes from '../models/demarches-types'
import DocumentsTypes from '../models/documents-types'
import Domaines from '../models/domaines'
import EtapesTypes from '../models/etapes-types'
import TitresTypesTypes from '../models/titres-types-types'

import {
  demarchesTypesQueryModify,
  domainesQueryModify,
  etapesTypesQueryModify
} from './permissions/metas'

import TitresTypes from '../models/titres-types'
import TitresTypesTitresStatuts from '../models/titres-types--titres-statuts'
import TitresTypesDemarchesTypesEtapesTypes from '../models/titres-types--demarches-types-etapes-types'
import TitresTypesDemarchesTypes from '../models/titres-types--demarches-types'
import EtapesTypesJustificatifsTypes from '../models/etapes-types--justificatifs-types'
import TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes from '../models/titres-types--demarches-types-etapes-types-justificatifs-types'
import Titres from '../models/titres'
import { sortedDevises } from 'camino-common/src/static/devise'
import { sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'
import { toDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes'

const titresTypesTypesGet = async () =>
  TitresTypesTypes.query().orderBy('ordre')

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

const titresTypesTitresStatutsGet = async () =>
  TitresTypesTitresStatuts.query().orderBy(['titreTypeId', 'titreStatutId'])

const titresTypesDemarchesTypesGet = async () =>
  TitresTypesDemarchesTypes.query().orderBy(['titreTypeId', 'demarcheTypeId'])

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

const titresTypesDemarchesTypesEtapesTypesJustificatifsTypesGet = async () =>
  TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes.query().orderBy([
    'titreTypeId',
    'demarcheTypeId',
    'etapeTypeId',
    'documentTypeId'
  ])

const etapesTypesDocumentsTypesGet = () => toDocuments()

const etapesTypesJustificatifsTypesGet = async () =>
  EtapesTypesJustificatifsTypes.query().orderBy([
    'etapeTypeId',
    'documentTypeId'
  ])

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

const demarchesStatutsGet = () => sortedDemarchesStatuts

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

export {
  domaineGet,
  domainesGet,
  titresTypesTypesGet,
  titresTypesGet,
  demarchesTypesGet,
  demarcheTypeGet,
  demarchesStatutsGet,
  etapesTypesGet,
  etapeTypeGet,
  devisesGet,
  documentsTypesGet,
  documentTypeGet,
  titresTypesTitresStatutsGet,
  titresTypesDemarchesTypesGet,
  titresTypesDemarchesTypesEtapesTypesGet,
  titreTypeDemarcheTypeEtapeTypeGet,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypesGet,
  etapesTypesDocumentsTypesGet,
  etapesTypesJustificatifsTypesGet
}
