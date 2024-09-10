import { CaminoDate, caminoDateValidator, dateAddDays, isBefore } from './date'
import { EtapeHeritageProps, MappingHeritagePropsNameEtapePropsName } from './heritage'
import { DOCUMENTS_TYPES_IDS, autreDocumentTypeIdValidator, documentTypeIdValidator } from './static/documentsTypes'
import { ETAPES_STATUTS, EtapeStatutId, etapeStatutIdValidator } from './static/etapesStatuts'
import { ETAPES_TYPES, EtapeTypeId, etapeTypeIdValidator } from './static/etapesTypes'
import { z } from 'zod'
import { tempDocumentNameValidator } from './document'
import { DemarcheTypeId } from './static/demarchesTypes'
import { TitreTypeId } from './static/titresTypes'
import { User, isEntrepriseOrBureauDEtude } from './roles'
import { autreAvisTypeIdValidator, avisStatutIdValidator, avisTypeIdSansAutreValidator, avisVisibilityIdValidator } from './static/avisTypes'
import { FlattenEtape, GraphqlEtape } from './etape-form'
import { DeepReadonly } from './typescript-tools'

export const etapeBrouillonValidator = z.boolean().brand('EtapeBrouillon')
export type EtapeBrouillon = z.infer<typeof etapeBrouillonValidator>

export const ETAPE_IS_BROUILLON = true as EtapeBrouillon
export const ETAPE_IS_NOT_BROUILLON = false as EtapeBrouillon

export const etapeIdValidator = z.string().brand<'EtapeId'>()
export type EtapeId = z.infer<typeof etapeIdValidator>

export const etapeSlugValidator = z.string().brand<'EtapeSlug'>()
export type EtapeSlug = z.infer<typeof etapeSlugValidator>

export const etapeIdOrSlugValidator = z.union([etapeIdValidator, etapeSlugValidator])
export type EtapeIdOrSlug = z.infer<typeof etapeIdOrSlugValidator>

type HeritageProp<T> = { actif: boolean; etape?: T | null }

type EtapePropsFromHeritagePropName<key extends EtapeHeritageProps> = MappingHeritagePropsNameEtapePropsName[key][number]

type EtapeWithHeritage = InternalEtapeWithHeritage<EtapeHeritageProps, Omit<GraphqlEtape, 'typeId' | 'date' | 'statutId'> & { typeId: EtapeTypeId; date: CaminoDate; statutId: EtapeStatutId }>

type HeritageContenu = Record<string, Record<string, HeritageProp<Pick<EtapeWithHeritage, 'contenu' | 'typeId' | 'date'>>>>
type InternalEtapeWithHeritage<HeritagePropsKeys extends EtapeHeritageProps, T extends Pick<GraphqlEtape, 'date' | EtapePropsFromHeritagePropName<HeritagePropsKeys>> & { typeId: EtapeTypeId }> = T & {
  heritageProps: {
    [key in HeritagePropsKeys]: HeritageProp<Pick<T, 'typeId' | 'date' | EtapePropsFromHeritagePropName<key>>>
  }
  heritageContenu: HeritageContenu
}

export const etapeTypeEtapeStatutWithMainStepValidator = z.object({ etapeTypeId: etapeTypeIdValidator, etapeStatutId: etapeStatutIdValidator, mainStep: z.boolean() })
export type EtapeTypeEtapeStatutWithMainStep = z.infer<typeof etapeTypeEtapeStatutWithMainStepValidator>

export const etapeDocumentIdValidator = z.string().brand('EtapeDocumentId')
export type EtapeDocumentId = z.infer<typeof etapeDocumentIdValidator>

const etapeDocumentWithoutDescriptionValidator = z.object({
  id: etapeDocumentIdValidator,
  public_lecture: z.boolean().default(false),
  entreprises_lecture: z.boolean().default(false),
})
export const etapeDocumentDescriptionOptionnelleValidator = etapeDocumentWithoutDescriptionValidator.extend({
  etape_document_type_id: documentTypeIdValidator,
  description: z.string().nullable(),
})
export const etapeDocumentDescriptionObligatoireValidator = etapeDocumentWithoutDescriptionValidator.extend({
  etape_document_type_id: autreDocumentTypeIdValidator,
  description: z.string().min(1),
})

export const etapeDocumentValidator = z.union([etapeDocumentDescriptionOptionnelleValidator, etapeDocumentDescriptionObligatoireValidator])
export type EtapeDocument = z.infer<typeof etapeDocumentValidator>

const documentComplementaireObligatoireCommon = z.object({
  date: caminoDateValidator,
  etape_statut_id: etapeStatutIdValidator,
})
export const documentTypeIdComplementaireObligatoireDAE = DOCUMENTS_TYPES_IDS.arretePrefectoral

const documentComplementaireObligatoireDAEValidator = documentComplementaireObligatoireCommon.extend({
  etape_document_type_id: z.literal(documentTypeIdComplementaireObligatoireDAE),
  arrete_prefectoral: z.string().nullable(),
})

export const documentTypeIdComplementaireObligatoireASL = DOCUMENTS_TYPES_IDS.lettre
const documentComplementaireObligatoireASLValidator = documentComplementaireObligatoireCommon.extend({
  etape_document_type_id: z.literal(documentTypeIdComplementaireObligatoireASL),
})

const getEtapeDocumentsByEtapeIdDaeDocumentValidator = etapeDocumentValidator.and(documentComplementaireObligatoireDAEValidator)
export type GetEtapeDocumentsByEtapeIdDaeDocument = z.infer<typeof getEtapeDocumentsByEtapeIdDaeDocumentValidator>

const getEtapeDocumentsByEtapeIdAslDocumentValidator = z.intersection(etapeDocumentValidator, documentComplementaireObligatoireASLValidator)
export type GetEtapeDocumentsByEtapeIdAslDocument = z.infer<typeof getEtapeDocumentsByEtapeIdAslDocumentValidator>

export const getEtapeDocumentsByEtapeIdValidator = z.object({
  etapeDocuments: z.array(etapeDocumentValidator),
  dae: getEtapeDocumentsByEtapeIdDaeDocumentValidator.nullable(),
  asl: getEtapeDocumentsByEtapeIdAslDocumentValidator.nullable(),
})

export type GetEtapeDocumentsByEtapeId = z.infer<typeof getEtapeDocumentsByEtapeIdValidator>

// Avis d'une étape
// ID
export const etapeAvisIdValidator = z.string().brand('EtapeAvis')
export type EtapeAvisId = z.infer<typeof etapeAvisIdValidator>

// L'avis (output tel qu'il sort de la base)
const commonEtapeAvisValidator = z.object({
  id: etapeAvisIdValidator,
  date: caminoDateValidator,
  avis_statut_id: avisStatutIdValidator,
  has_file: z.boolean(),
  avis_visibility_id: avisVisibilityIdValidator,
})
const regularEtapeAvisValidator = commonEtapeAvisValidator.extend({
  avis_type_id: avisTypeIdSansAutreValidator,
  description: z.string().nullable(),
})
const autreEtapeAvisValidator = commonEtapeAvisValidator.extend({
  avis_type_id: autreAvisTypeIdValidator,
  description: z.string().min(1),
})

export const etapeAvisValidator = z.union([regularEtapeAvisValidator, autreEtapeAvisValidator])
export type EtapeAvis = z.infer<typeof etapeAvisValidator>

// L'étape (input de modification)
const tempDocumentName = {
  temp_document_name: tempDocumentNameValidator.optional(),
}
const etapeAvisWithFileModificationValidator = z.union([regularEtapeAvisValidator.extend(tempDocumentName), autreEtapeAvisValidator.extend(tempDocumentName)])
export type EtapeAvisWithFileModification = z.infer<typeof etapeAvisWithFileModificationValidator>

// L'étape (input de création)
const regularEtapeAvisWithoutIdValidator = regularEtapeAvisValidator.omit({ id: true, has_file: true })
const autreEtapeAvisWithoutIdValidator = autreEtapeAvisValidator.omit({ id: true, has_file: true })
export const etapeAvisWithoutIdValidator = z.union([regularEtapeAvisWithoutIdValidator, autreEtapeAvisWithoutIdValidator])

export const tempEtapeAvisValidator = z.union([regularEtapeAvisWithoutIdValidator.extend(tempDocumentName), autreEtapeAvisWithoutIdValidator.extend(tempDocumentName)])
export type TempEtapeAvis = z.infer<typeof tempEtapeAvisValidator>

// Divers inputs de fonctions externes
export const getEtapeAvisByEtapeIdValidator = z.array(etapeAvisValidator)

export type GetEtapeAvisByEtapeId = z.infer<typeof getEtapeAvisByEtapeIdValidator>

export const etapeAvisModificationValidator = z.union([etapeAvisWithFileModificationValidator, tempEtapeAvisValidator])
export type EtapeAvisModification = z.infer<typeof etapeAvisModificationValidator>

export const needAslAndDae = (
  tde: {
    etapeTypeId: EtapeTypeId
    demarcheTypeId: DemarcheTypeId
    titreTypeId: TitreTypeId
  },
  isBrouillon: EtapeBrouillon,
  user: User
): boolean => {
  return tde.etapeTypeId === 'mfr' && tde.demarcheTypeId === 'oct' && tde.titreTypeId === 'axm' && isEntrepriseOrBureauDEtude(user) && isBrouillon
}

export const tempEtapeDocumentDescriptionOptionnelleValidator = etapeDocumentDescriptionOptionnelleValidator.omit({ id: true }).extend({ temp_document_name: tempDocumentNameValidator })
export const tempEtapeDocumentDescriptionObligatoireValidator = etapeDocumentDescriptionObligatoireValidator.omit({ id: true }).extend({ temp_document_name: tempDocumentNameValidator })
export const tempEtapeDocumentValidator = z.union([tempEtapeDocumentDescriptionOptionnelleValidator, tempEtapeDocumentDescriptionObligatoireValidator])
export type TempEtapeDocument = z.infer<typeof tempEtapeDocumentValidator>

const etapeDocumentDescriptionOptionnelleWithFileModificationValidator = etapeDocumentDescriptionOptionnelleValidator.extend({ temp_document_name: tempDocumentNameValidator.optional() })
const etapeDocumentDescriptionObligatoireWithFileModificationValidator = etapeDocumentDescriptionObligatoireValidator.extend({ temp_document_name: tempDocumentNameValidator.optional() })
const etapeDocumentWithFileModificationValidator = z.union([etapeDocumentDescriptionOptionnelleWithFileModificationValidator, etapeDocumentDescriptionObligatoireWithFileModificationValidator])
export type EtapeDocumentWithFileModification = z.infer<typeof etapeDocumentWithFileModificationValidator>
export const etapeDocumentModificationValidator = z.union([etapeDocumentWithFileModificationValidator, tempEtapeDocumentValidator])
export type EtapeDocumentModification = z.infer<typeof etapeDocumentModificationValidator>

export const documentComplementaireDaeEtapeDocumentModificationValidator = etapeDocumentModificationValidator.and(documentComplementaireObligatoireDAEValidator)
export type DocumentComplementaireDaeEtapeDocumentModification = z.infer<typeof documentComplementaireDaeEtapeDocumentModificationValidator>

export const documentComplementaireAslEtapeDocumentModificationValidator = etapeDocumentModificationValidator.and(documentComplementaireObligatoireASLValidator)
export type DocumentComplementaireAslEtapeDocumentModification = z.infer<typeof documentComplementaireAslEtapeDocumentModificationValidator>

export const etapeNoteValidator = z.object({ valeur: z.string(), is_avertissement: z.boolean() })
export type EtapeNote = z.infer<typeof etapeNoteValidator>

export const getStatutId = (etape: Pick<DeepReadonly<FlattenEtape>, 'date' | 'contenu' | 'typeId' | 'statutId'>, currentDate: CaminoDate): EtapeStatutId => {
  if (etape.typeId !== ETAPES_TYPES.participationDuPublic) {
    return etape.statutId
  }

  if (isBefore(currentDate, etape.date)) {
    return ETAPES_STATUTS.PROGRAMME
  } else if (isBefore(currentDate, dateAddDays(etape.date, z.number().parse(etape.contenu?.opdp?.duree.value ?? 0)))) {
    return ETAPES_STATUTS.EN_COURS
  } else {
    return ETAPES_STATUTS.TERMINE
  }
}
