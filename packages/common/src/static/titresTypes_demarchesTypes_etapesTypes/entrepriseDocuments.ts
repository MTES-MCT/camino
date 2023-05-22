import { isNotNullNorUndefined, onlyUnique } from '../../typescript-tools.js'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from '../demarchesTypes.js'
import { DocumentsTypes, DOCUMENTS_TYPES_IDS, EntrepriseDocumentTypeId, EntrepriseDocumentType, isEntrepriseDocumentTypeId } from '../documentsTypes.js'
import { ETAPES_TYPES, EtapeTypeId, isEtapeTypeId } from '../etapesTypes.js'
import { TitreTypeId, TITRES_TYPES_IDS } from '../titresTypes.js'
import { TDEType } from './index.js'

const EtapesTypesEntrepriseDocumentsTypes = {
  [ETAPES_TYPES.demande]: [
    DOCUMENTS_TYPES_IDS.attestationFiscale,
    DOCUMENTS_TYPES_IDS.avisDeSituationAuRepertoireSirene,
    DOCUMENTS_TYPES_IDS.curriculumVitae,
    DOCUMENTS_TYPES_IDS.identificationDeMateriel,
    DOCUMENTS_TYPES_IDS.justificatifDIdentite,
    DOCUMENTS_TYPES_IDS.justificatifDesCapacitesTechniques,
    DOCUMENTS_TYPES_IDS.kbis,
    DOCUMENTS_TYPES_IDS.justificatifDesCapacitesFinancieres,
  ],
  [ETAPES_TYPES.receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_]: [DOCUMENTS_TYPES_IDS.kbis],
  [ETAPES_TYPES.modificationDeLaDemande]: [DOCUMENTS_TYPES_IDS.attestationFiscale, DOCUMENTS_TYPES_IDS.justificatifDesCapacitesFinancieres],
} as const satisfies { [key in EtapeTypeId]?: readonly EntrepriseDocumentTypeId[] }

const isEtapesTypesEntrepriseDocumentsTypes = (etapeTypeId?: EtapeTypeId): etapeTypeId is keyof typeof EtapesTypesEntrepriseDocumentsTypes => {
  return Object.keys(EtapesTypesEntrepriseDocumentsTypes).includes(etapeTypeId)
}

const TDEEntrepriseDocumentsTypes = {
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: {
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: {
        [DOCUMENTS_TYPES_IDS.kbis]: { optionnel: false },
        [DOCUMENTS_TYPES_IDS.justificatifDesCapacitesFinancieres]: { optionnel: false },
        [DOCUMENTS_TYPES_IDS.justificatifDesCapacitesTechniques]: { optionnel: false },
        [DOCUMENTS_TYPES_IDS.justificatifDIdentite]: { optionnel: false },
        [DOCUMENTS_TYPES_IDS.attestationFiscale]: { optionnel: false },
        [DOCUMENTS_TYPES_IDS.curriculumVitae]: { optionnel: false },
        [DOCUMENTS_TYPES_IDS.identificationDeMateriel]: { optionnel: true },
      },
    },
  },
  [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: {
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: {
        [DOCUMENTS_TYPES_IDS.justificatifDIdentite]: { optionnel: false, description: "Pièces d'identification du demandeur (personne physique ou société)" },
        [DOCUMENTS_TYPES_IDS.listeDesTravauxAnterieurs]: { optionnel: false, description: 'Liste des travaux auxquels le demandeur a participé au cours des 3 dernières années' },
        [DOCUMENTS_TYPES_IDS.justificatifDAdhesionALaCharteDesBonnesPratiques]: { optionnel: false },
        [DOCUMENTS_TYPES_IDS.attestationFiscale]: {
          optionnel: false,
          description:
            'Attestation sur l’honneur certifiant que le demandeur est en règle au regard de ses obligations fiscales et en matière de paiement de ses cotisations sociales (décret 2001-204, art. 7).',
        },
        [DOCUMENTS_TYPES_IDS.justificatifDesCapacitesTechniques]: {
          optionnel: false,
          description:
            'La justification du choix de la zone considérée, la situation du périmètre par rapport aux documents d’urbanisme, la situation du périmètre par rapport aux titres miniers et autorisations d’exploitation existants, les activités passées d’orpaillage et leurs conséquences sur les site.',
        },
        [DOCUMENTS_TYPES_IDS.TroisDerniersBilansEtComptesDeResultats]: {
          optionnel: false,
          description: 'Ces pièces sont demandées au titre de la justification des capacités financières du demandeur (décret 2001-204, art. 7)',
        },
        [DOCUMENTS_TYPES_IDS.referencesProfessionnelles]: {
          optionnel: false,
          description:
            'Références professionnelles du demandeur ou celles des cadres chargés du suivi et de la conduite des travauxCes pièces sont demandées au titre la justification des capacités techniques du demandeur (décret 2001-204, art. 6).\n \n S’il s’agit d’une personne morale, références professionnelles du ou des cadres chargés du suivi et de la conduite des travaux',
        },
        [DOCUMENTS_TYPES_IDS.declarationsBancairesOuCautionsAppropriees]: {
          optionnel: false,
          description: 'Ces pièces sont demandées au titre de la justification des capacités financières du demandeur (décret 2001-204, art. 7)',
        },
      },
    },
  },
} as const satisfies {
  [titreKey in TitreTypeId]?: {
    [demarcheKey in keyof TDEType[titreKey]]?: {
      [key in Extract<TDEType[titreKey][demarcheKey], readonly EtapeTypeId[]>[number]]?: { [key in EntrepriseDocumentTypeId]?: { optionnel: boolean; description?: string } }
    }
  }
}

export const toEntrepriseDocuments = (): { etapeTypeId: EtapeTypeId; documentTypeId: EntrepriseDocumentTypeId; optionnel: boolean; description: string | null }[] => {
  return Object.entries(EtapesTypesEntrepriseDocumentsTypes).flatMap(([key, values]) => {
    if (isEtapeTypeId(key)) {
      return values.map(value => ({ etapeTypeId: key, documentTypeId: value, description: null, optionnel: true }))
    } else {
      return []
    }
  })
}

export const getEntrepriseDocuments = (titreTypeId?: TitreTypeId, demarcheTypeId?: DemarcheTypeId, etapeTypeId?: EtapeTypeId): EntrepriseDocumentType[] => {
  if (isNotNullNorUndefined(titreTypeId) && isNotNullNorUndefined(demarcheTypeId) && isNotNullNorUndefined(etapeTypeId)) {
    const documentsIds: EntrepriseDocumentTypeId[] = []

    if (isEtapesTypesEntrepriseDocumentsTypes(etapeTypeId)) {
      documentsIds.push(...EtapesTypesEntrepriseDocumentsTypes[etapeTypeId])
    }
    type TDEEntrepriseDocumentsTypesUnleashed = {
      [key in TitreTypeId]?: { [key in DemarcheTypeId]?: { [key in EtapeTypeId]?: { [key in EntrepriseDocumentTypeId]: { optionnel: boolean; description?: string } } } }
    }

    documentsIds.push(...Object.keys((TDEEntrepriseDocumentsTypes as TDEEntrepriseDocumentsTypesUnleashed)[titreTypeId]?.[demarcheTypeId]?.[etapeTypeId] ?? {}).filter(isEntrepriseDocumentTypeId))

    return documentsIds.filter(onlyUnique).map(documentTypeId => {
      const documentSpecifique = (TDEEntrepriseDocumentsTypes as TDEEntrepriseDocumentsTypesUnleashed)[titreTypeId]?.[demarcheTypeId]?.[etapeTypeId]?.[documentTypeId]
      const document = { ...DocumentsTypes[documentTypeId], optionnel: true }
      if (documentSpecifique) {
        document.optionnel = documentSpecifique.optionnel
        document.description = documentSpecifique.description ?? document.description
      }

      return document
    })
  } else {
    throw new Error(`il manque des éléments pour trouver les documents titreTypeId: '${titreTypeId}', demarcheTypeId: ${demarcheTypeId}, etapeTypeId: ${etapeTypeId}`)
  }
}
