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
import { sortedDevises } from 'camino-common/src/static/devise.js'
import { sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts.js'
import { toDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents.js'

export const titresTypesTypesGet = async () => TitresTypesTypes.query().orderBy('ordre')

export const domainesGet = async (_: never, { fields }: { fields?: IFields }) => {
  const graph = fields ? graphBuild(fields, 'titre', fieldsFormat) : options.domaines.graph

  return Domaines.query().withGraphFetched(graph).orderBy('ordre')
}

export const titresTypesGet = async (_: never, { fields }: { fields?: IFields }) => {
  const graph = fields ? graphBuild(fields, 'titresTypes', fieldsFormat) : options.titresTypes.graph

  return TitresTypes.query().withGraphFetched(graph).orderBy('id')
}

export const etapesTypesDocumentsTypesGet = () => toDocuments()

export const demarchesStatutsGet = () => sortedDemarchesStatuts

export const etapeTypeGet = async (id: string, { fields }: { fields?: IFields }) => {
  const graph = fields ? graphBuild(fields, 'etapesTypes', fieldsFormat) : []

  return EtapesTypes.query().withGraphFetched(graph).findById(id)
}

export const devisesGet = () => sortedDevises

export const documentsTypesGet = async ({ repertoire, typeId }: { repertoire?: IDocumentRepertoire; typeId?: string }) => {
  const q = DocumentsTypes.query().orderBy('nom')

  q.select('documentsTypes.*')

  if (typeId && repertoire === 'demarches') {
    q.join('etapesTypes__documentsTypes as et_dt', b => {
      b.on(knex.raw('?? = ?', ['et_dt.etapeTypeId', typeId]))
      b.on(knex.raw('?? = ??', ['et_dt.documentTypeId', 'documentsTypes.id']))
    })

    q.select(raw('?? is true', ['et_dt.optionnel']).as('optionnel'))
  }

  return q
}

export const documentTypeGet = async (id: string) => DocumentsTypes.query().findById(id)
