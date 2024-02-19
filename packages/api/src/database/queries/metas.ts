import { raw } from 'objection'

import { IDocumentRepertoire } from '../../types.js'

import { knex } from '../../knex.js'

import { FieldId } from './_options.js'
import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'

import DocumentsTypes from '../models/documents-types.js'
import EtapesTypes from '../models/etapes-types.js'

import { sortedDevises } from 'camino-common/src/static/devise.js'
import { sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { toDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents.js'

export const etapesTypesDocumentsTypesGet = () => toDocuments()

export const demarchesStatutsGet = () => sortedDemarchesStatuts

export const etapeTypeGet = async (id: string, { fields }: { fields?: FieldId }) => {
  const graph = fields ? graphBuild(fields, 'etapesTypes', fieldsFormat) : []

  return EtapesTypes.query().withGraphFetched(graph).findById(id)
}

export const devisesGet = () => sortedDevises

export const documentsTypesGet = async ({ repertoire, typeId }: { repertoire?: IDocumentRepertoire; typeId?: string }) => {
  const q = DocumentsTypes.query().orderBy('nom')

  q.select('documentsTypes.*')

  if (isNotNullNorUndefined(typeId) && repertoire === 'demarches') {
    q.join('etapesTypes__documentsTypes as et_dt', b => {
      b.on(knex.raw('?? = ?', ['et_dt.etapeTypeId', typeId]))
      b.on(knex.raw('?? = ??', ['et_dt.documentTypeId', 'documentsTypes.id']))
    })

    q.select(raw('?? is true', ['et_dt.optionnel']).as('optionnel'))
  }

  return q
}

export const documentTypeGet = async (id: string) => DocumentsTypes.query().findById(id)
