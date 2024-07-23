import { sortedDevises } from 'camino-common/src/static/devise'
import { sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'
import { toDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'

export const etapesTypesDocumentsTypesGet = () => toDocuments()

export const demarchesStatutsGet = () => sortedDemarchesStatuts

export const devisesGet = () => sortedDevises
