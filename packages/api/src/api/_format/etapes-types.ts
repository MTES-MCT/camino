import {
  DemarcheId,
  IDemarcheType,
  IEtapeType,
  ISection,
  ITitre,
  ITitreEtape
} from '../../types'

import { titreDemarcheUpdatedEtatValidate } from '../../business/validations/titre-demarche-etat-validate'
import { titreDemarcheDepotDemandeDateFind } from '../../business/rules/titre-demarche-depot-demande-date-find'

import { dupRemove } from '../../tools/index'
import { titreSectionsFormat } from './titres-sections'

import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes'
import { DocumentType } from 'camino-common/src/static/documentsTypes'
import { getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'

const etapeTypeSectionsFormat = (
  sections: ISection[] | undefined | null,
  sectionsSpecifiques: ISection[] | undefined | null
) => {
  let result: ISection[] = []

  if (sectionsSpecifiques?.length) {
    result.push(...sectionsSpecifiques)
  }

  // fusion des sections par défaut de l'étape type
  // avec les sections spécifiques au type / démarche / étape
  // si deux sections ont la même id, seule la custom est conservée
  if (result.length && sections?.length) {
    result = dupRemove('id', result, sections) as ISection[]
  } else if (sections?.length) {
    result = sections
  }

  return titreSectionsFormat(result)
}

const documentsTypesFormat = (
  documentsTypes: DocumentType[] | undefined | null,
  documentsTypesSpecifiques: DocumentType[] | undefined | null
): DocumentType[] => {
  let result: DocumentType[] = []

  if (documentsTypes?.length) {
    result = [...documentsTypes]
  }

  if (documentsTypesSpecifiques?.length) {
    documentsTypesSpecifiques.forEach(documentTypeSpecifique => {
      const documentType = result.find(
        ({ id }) => id === documentTypeSpecifique.id
      )

      // Si il est déjà présent, on override juste son attribut « optionnel » et sa description
      if (documentType) {
        documentType.optionnel = documentTypeSpecifique.optionnel
        documentType.description =
          documentTypeSpecifique.description || documentType.description
      } else {
        result.push(documentTypeSpecifique)
      }
    })
  }

  return result
}
export interface DocumentTypeData {
  domaineId: DomaineId
  titreTypeTypeId: TitreTypeTypeId
  demarcheTypeId: DemarcheTypeId
  etapeTypeId: EtapeTypeId
}

const etapeTypeFormat = (
  etape: ITitreEtape,
  sectionsSpecifiques: ISection[] | null | undefined,
  justificatifsTypesSpecifiques: DocumentType[] | null | undefined,
  documentTypeData: DocumentTypeData | null = null
) => {
  const etapeType = etape.type
  if (etapeType) {
    etapeType.sections = etapeTypeSectionsFormat(
      etapeType.sections,
      sectionsSpecifiques
    )

    if (documentTypeData === null) {
      const domaineId = etape?.demarche?.titre?.domaineId
      const typeId = etape?.demarche?.titre?.typeId
      if (!typeId) {
        throw new Error(
          `le type du titre de l'étape ${etape.id} n'est pas chargé`
        )
      }
      const titreTypeTypeId = getTitreTypeType(typeId)
      const demarcheTypeId = etape?.demarche?.typeId
      const etapeTypeId = etape?.typeId

      etapeType.documentsTypes = getDocuments(
        titreTypeTypeId,
        domaineId,
        demarcheTypeId,
        etapeTypeId
      )
    } else {
      etapeType.documentsTypes = getDocuments(
        documentTypeData.titreTypeTypeId,
        documentTypeData.domaineId,
        documentTypeData.demarcheTypeId,
        documentTypeData.etapeTypeId
      )
    }
    // on ajoute les justificatifs spécifiques
    etapeType.justificatifsTypes = documentsTypesFormat(
      etapeType.justificatifsTypes,
      justificatifsTypesSpecifiques
    )
  }

  return etapeType
}

const etapeTypeDateFinCheck = (
  etapeType: IEtapeType,
  titreEtapes?: ITitreEtape[] | null
) => {
  if (!etapeType.dateFin || !titreEtapes) return true

  const dateDemande = titreDemarcheDepotDemandeDateFind(titreEtapes)

  // si
  // - la date de demande est absente,
  // - et le type d'étape a une date de fin
  // alors on ne propose pas ce type d'étape
  // Exemple: Si on a pas de date de demande, on ne peut pas proposer la « décision de l’ONF »
  // car cette étape est proposable que pour les demandes antérieures au 01/01/2020
  return dateDemande ? dateDemande < etapeType.dateFin : false
}

const etapeTypeIsValidCheck = (
  etapeType: IEtapeType,
  date: string,
  titre: ITitre,
  demarcheType: IDemarcheType,
  demarcheId: DemarcheId,
  titreDemarcheEtapes?: ITitreEtape[] | null,
  titreEtape?: ITitreEtape
) => {
  const isDateFinValid = etapeTypeDateFinCheck(etapeType, titreDemarcheEtapes)

  if (!isDateFinValid) return false

  if (!titreEtape) {
    titreEtape = {} as ITitreEtape
  }

  titreEtape.typeId = etapeType.id
  titreEtape.date = date

  return !titreDemarcheUpdatedEtatValidate(
    demarcheType,
    titre,
    titreEtape,
    demarcheId,
    titreDemarcheEtapes
  ).length
}

export {
  etapeTypeIsValidCheck,
  etapeTypeSectionsFormat,
  etapeTypeFormat,
  documentsTypesFormat
}
