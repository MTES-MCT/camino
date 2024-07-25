import { ITitreEtape } from '../../types'

import { titreDemarcheDepotDemandeDateFind } from '../../business/rules/titre-demarche-depot-demande-date-find'

import { DocumentType } from 'camino-common/src/static/documentsTypes'
import { EtapesTypes, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

export const documentsTypesFormat = (documentsTypes: DocumentType[] | undefined | null, documentsTypesSpecifiques: DocumentType[] | undefined | null): DocumentType[] => {
  let result: DocumentType[] = []

  if (isNotNullNorUndefinedNorEmpty(documentsTypes)) {
    result = [...documentsTypes]
  }

  if (isNotNullNorUndefinedNorEmpty(documentsTypesSpecifiques)) {
    documentsTypesSpecifiques.forEach(documentTypeSpecifique => {
      const documentType = result.find(({ id }) => id === documentTypeSpecifique.id)

      // Si il est déjà présent, on override juste son attribut « optionnel » et sa description
      if (documentType) {
        documentType.optionnel = documentTypeSpecifique.optionnel
        documentType.description = documentTypeSpecifique.description ?? documentType.description
      } else {
        result.push(documentTypeSpecifique)
      }
    })
  }

  return result
}

export const etapeTypeDateFinCheck = (etapeTypeId: EtapeTypeId, titreEtapes?: Pick<ITitreEtape, 'typeId' | 'date'>[] | null): boolean => {
  const etapeTypeDateFin = EtapesTypes[etapeTypeId].date_fin
  if (!etapeTypeDateFin || !titreEtapes) return true

  const dateDemande = titreDemarcheDepotDemandeDateFind(titreEtapes)

  // si
  // - la date de demande est absente,
  // - et le type d'étape a une date de fin
  // alors on ne propose pas ce type d'étape
  // Exemple: Si on a pas de date de demande, on ne peut pas proposer la « décision de l’ONF »
  // car cette étape est proposable que pour les demandes antérieures au 01/01/2020
  return dateDemande ? dateDemande <= etapeTypeDateFin : false
}
