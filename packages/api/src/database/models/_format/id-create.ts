import { DemarcheId } from 'camino-common/src/demarche.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { DocumentId, documentIdValidator } from 'camino-common/src/entreprise.js'
import { DocumentTypeId } from 'camino-common/src/static/documentsTypes.js'
import { randomBytes } from 'node:crypto'

export const idGenerate = <T extends string = string>(): T => randomBytes(12).toString('hex') as T

// TODO 2022-09-13 il faudrait ajouter un préfixe dédié aux démarche à l’id.
// pour pouvoir utiliser « is » de Typescript et controler qu’on ne met pas n’importe quel string dans cette méthode
export const newDemarcheId = (value: string = idGenerate()): DemarcheId => {
  return value as DemarcheId
}

export const newDocumentId = (date: CaminoDate, documentTypeId: DocumentTypeId): DocumentId => {
  const hash = randomBytes(4).toString('hex')

  return documentIdValidator.parse(`${date}-${documentTypeId}-${hash}`)
}
