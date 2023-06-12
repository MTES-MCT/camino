import { IDemarcheType, ITitre, ITitreEtape } from '../../types.js'

import { titreDemarcheUpdatedEtatValidate } from '../../business/validations/titre-demarche-etat-validate.js'
import { titreDemarcheDepotDemandeDateFind } from '../../business/rules/titre-demarche-depot-demande-date-find.js'

import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents.js'
import { DocumentType } from 'camino-common/src/static/documentsTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { EtapesTypes, EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { DemarcheId } from 'camino-common/src/demarche.js'

export const documentsTypesFormat = (documentsTypes: DocumentType[] | undefined | null, documentsTypesSpecifiques: DocumentType[] | undefined | null): DocumentType[] => {
  let result: DocumentType[] = []

  if (documentsTypes?.length) {
    result = [...documentsTypes]
  }

  if (documentsTypesSpecifiques?.length) {
    documentsTypesSpecifiques.forEach(documentTypeSpecifique => {
      const documentType = result.find(({ id }) => id === documentTypeSpecifique.id)

      // Si il est déjà présent, on override juste son attribut « optionnel » et sa description
      if (documentType) {
        documentType.optionnel = documentTypeSpecifique.optionnel
        documentType.description = documentTypeSpecifique.description || documentType.description
      } else {
        result.push(documentTypeSpecifique)
      }
    })
  }

  return result
}
export interface DocumentTypeData {
  titreTypeId: TitreTypeId
  demarcheTypeId: DemarcheTypeId
  etapeTypeId: EtapeTypeId
}

export const etapeTypeFormat = (etape: ITitreEtape, documentTypeData: DocumentTypeData | null = null) => {
  const etapeType = etape.type
  if (etapeType) {
    if (documentTypeData === null) {
      const typeId = etape?.demarche?.titre?.typeId
      if (!typeId) {
        throw new Error(`le type du titre de l'étape ${etape.id} n'est pas chargé`)
      }
      const demarcheTypeId = etape?.demarche?.typeId
      const etapeTypeId = etape?.typeId

      etapeType.documentsTypes = getDocuments(typeId, demarcheTypeId, etapeTypeId)
    } else {
      etapeType.documentsTypes = getDocuments(documentTypeData.titreTypeId, documentTypeData.demarcheTypeId, documentTypeData.etapeTypeId)
    }
  }

  return etapeType
}

const etapeTypeDateFinCheck = (etapeTypeId: EtapeTypeId, titreEtapes?: ITitreEtape[] | null) => {
  const etapeTypeDateFin = EtapesTypes[etapeTypeId].dateFin
  if (!etapeTypeDateFin || !titreEtapes) return true

  const dateDemande = titreDemarcheDepotDemandeDateFind(titreEtapes)

  // si
  // - la date de demande est absente,
  // - et le type d'étape a une date de fin
  // alors on ne propose pas ce type d'étape
  // Exemple: Si on a pas de date de demande, on ne peut pas proposer la « décision de l’ONF »
  // car cette étape est proposable que pour les demandes antérieures au 01/01/2020
  return dateDemande ? dateDemande < etapeTypeDateFin : false
}

export const etapeTypeIsValidCheck = (
  etapeTypeId: EtapeTypeId,
  date: CaminoDate,
  titre: ITitre,
  demarcheType: IDemarcheType,
  demarcheId: DemarcheId,
  titreDemarcheEtapes?: ITitreEtape[] | null,
  titreEtape?: ITitreEtape
) => {
  const isDateFinValid = etapeTypeDateFinCheck(etapeTypeId, titreDemarcheEtapes)

  if (!isDateFinValid) return false

  if (!titreEtape) {
    titreEtape = {} as ITitreEtape
  }

  titreEtape.typeId = etapeTypeId
  titreEtape.date = date

  return !titreDemarcheUpdatedEtatValidate(demarcheType, titre, titreEtape, demarcheId, titreDemarcheEtapes).length
}
