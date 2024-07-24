import { DemarcheId } from 'camino-common/src/demarche'
import { CaminoDate } from 'camino-common/src/date'
import { EntrepriseDocumentId, entrepriseDocumentIdValidator } from 'camino-common/src/entreprise'
import { ActiviteDocumentTypeId, AutreDocumentTypeId, DocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { randomBytes } from 'node:crypto'
import { TitreId } from 'camino-common/src/validators/titres'
import { EtapeAvisId, EtapeDocumentId, EtapeId, etapeAvisIdValidator, etapeDocumentIdValidator } from 'camino-common/src/etape'
import { UtilisateurId } from 'camino-common/src/roles'
import { ActiviteDocumentId, activiteDocumentIdValidator } from 'camino-common/src/activite'
import { AvisTypeId } from 'camino-common/src/static/avisTypes'

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

export const newEtapeDocumentId = (date: CaminoDate, documentTypeId: DocumentTypeId | AutreDocumentTypeId): EtapeDocumentId => {
  const hash = idGenerate(8)

  return etapeDocumentIdValidator.parse(`${date}-${documentTypeId}-${hash}`)
}
export const newEtapeAvisId = (avisTypeId: AvisTypeId): EtapeAvisId => {
  const hash = idGenerate(8)

  return etapeAvisIdValidator.parse(`avis-${avisTypeId}-${hash}`)
}

export const newUtilisateurId = (value: string = idGenerate(6)): UtilisateurId => {
  return value as UtilisateurId
}
