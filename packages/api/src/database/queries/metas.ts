import { sortedDevises } from 'camino-common/src/static/devise.js'
import { sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts.js'
import { toDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents.js'

export const etapesTypesDocumentsTypesGet = () => toDocuments()

export const demarchesStatutsGet = () => sortedDemarchesStatuts

export const devisesGet = () => sortedDevises
