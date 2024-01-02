import { DemarcheId } from 'camino-common/src/demarche.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { DocumentId, EntrepriseDocumentId, documentIdValidator, entrepriseDocumentIdValidator } from 'camino-common/src/entreprise.js'
import { ActiviteDocumentTypeId, DocumentTypeId } from 'camino-common/src/static/documentsTypes.js'
import { randomBytes } from 'node:crypto'
import { TitreId } from 'camino-common/src/titres.js'
import { EtapeId } from 'camino-common/src/etape.js'
import { UtilisateurId } from 'camino-common/src/roles.js'
import { ActiviteDocumentId, activiteDocumentIdValidator } from 'camino-common/src/activite.js'

export const idGenerate = <T extends string = string>(length = 24): T => randomBytes(length / 2).toString('hex') as T

// TODO 2022-09-13 il faudrait ajouter un préfixe dédié aux démarche à l’id.
// pour pouvoir utiliser « is » de Typescript et controler qu’on ne met pas n’importe quel string dans cette méthode
export const newDemarcheId = (value: string = idGenerate()): DemarcheId => {
  return value as DemarcheId
}

export const newTitreId = (value: string = idGenerate()): TitreId => {
  return value as TitreId
}

export const newEtapeId = (value: string = idGenerate()): EtapeId => {
  return value as EtapeId
}

export const newEnterpriseDocumentId = (date: CaminoDate, documentTypeId: DocumentTypeId): EntrepriseDocumentId => {
  const hash = idGenerate(8)

  return entrepriseDocumentIdValidator.parse(`${date}-${documentTypeId}-${hash}`)
}

export const newActiviteDocumentId = (date: CaminoDate, activiteDocumentTypeId: ActiviteDocumentTypeId): ActiviteDocumentId => {
  const hash = idGenerate(8)

  return activiteDocumentIdValidator.parse(`${date}-${activiteDocumentTypeId}-${hash}`)
}

export const newDocumentId = (date: CaminoDate, documentTypeId: DocumentTypeId): DocumentId => {
  const hash = idGenerate(8)

  return documentIdValidator.parse(`${date}-${documentTypeId}-${hash}`)
}

export const newUtilisateurId = (value: string = idGenerate(6)): UtilisateurId => {
  return value as UtilisateurId
}
