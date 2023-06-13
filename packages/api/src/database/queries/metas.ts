import { raw } from 'objection'

import { IFields, IDocumentRepertoire } from '../../types.js'

import { knex } from '../../knex.js'

import options from './_options.js'
import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'

import DocumentsTypes from '../models/documents-types.js'
import Domaines from '../models/domaines.js'
import EtapesTypes from '../models/etapes-types.js'
import TitresTypesTypes from '../models/titres-types-types.js'

import TitresTypes from '../models/titres-types.js'
import TitresTypesDemarchesTypesEtapesTypes from '../models/titres-types--demarches-types-etapes-types.js'
import { sortedDevises } from 'camino-common/src/static/devise.js'
import { sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts.js'
import { toDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents.js'

const titresTypesTypesGet = async () => TitresTypesTypes.query().orderBy('ordre')

const domainesGet = async (_: never, { fields }: { fields?: IFields }) => {
  const graph = fields ? graphBuild(fields, 'titre', fieldsFormat) : options.domaines.graph

  return Domaines.query().withGraphFetched(graph).orderBy('ordre')
}

const titresTypesGet = async (_: never, { fields }: { fields?: IFields }) => {
  const graph = fields ? graphBuild(fields, 'titresTypes', fieldsFormat) : options.titresTypes.graph

  return TitresTypes.query().withGraphFetched(graph).orderBy('id')
}

const titresTypesDemarchesTypesEtapesTypesGet = async () => TitresTypesDemarchesTypesEtapesTypes.query().orderBy(['titreTypeId', 'demarcheTypeId', 'etapeTypeId'])

const titreTypeDemarcheTypeEtapeTypeGet = async (
  {
    titreTypeId,
    demarcheTypeId,
    etapeTypeId,
  }: {
    titreTypeId: string
    demarcheTypeId: string
    etapeTypeId: string
  },
  { fields }: { fields?: IFields }
) => {
  const graph = fields ? graphBuild(fields, 'titresTypesDemarchesTypesEtapesTypes', fieldsFormat) : []

  return TitresTypesDemarchesTypesEtapesTypes.query().findById([titreTypeId, demarcheTypeId, etapeTypeId]).withGraphFetched(graph)
}

const etapesTypesDocumentsTypesGet = () => toDocuments()

const demarchesStatutsGet = () => sortedDemarchesStatuts

const etapesTypesGet = async (
  {
    travaux,
  }: {
    travaux?: boolean
  },
  { fields }: { fields?: IFields }
) => {
  const graph = fields ? graphBuild(fields, 'etapesTypes', fieldsFormat) : []

  const q = EtapesTypes.query().withGraphFetched(graph)

  q.orderBy('ordre')

  if (travaux === false || travaux === true) {
    const travauxQuery = TitresTypesDemarchesTypesEtapesTypes.query().leftJoinRelated('demarcheType').whereRaw('?? = ??', ['etapeTypeId', 'etapesTypes.id'])
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

const documentsTypesGet = async ({ repertoire, typeId }: { repertoire?: IDocumentRepertoire; typeId?: string }) => {
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
    }
  }

  return q
}

const documentTypeGet = async (id: string) => DocumentsTypes.query().findById(id)

export {
  domainesGet,
  titresTypesTypesGet,
  titresTypesGet,
  demarchesStatutsGet,
  etapesTypesGet,
  etapeTypeGet,
  devisesGet,
  documentsTypesGet,
  documentTypeGet,
  titresTypesDemarchesTypesEtapesTypesGet,
  titreTypeDemarcheTypeEtapeTypeGet,
  etapesTypesDocumentsTypesGet,
}
