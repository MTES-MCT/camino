import { CaminoDate, caminoDateValidator, dateAddDays, isBefore } from './date'
import { EtapeHeritageProps, MappingHeritagePropsNameEtapePropsName } from './heritage'
import { autreDocumentTypeIdValidator, documentTypeIdValidator } from './static/documentsTypes'
import { ETAPES_STATUTS, EtapeStatutId, etapeStatutIdValidator } from './static/etapesStatuts'
import { EtapeTypeId, etapeTypeIdValidator, isEtapeWithAutomaticStatuts } from './static/etapesTypes'
import { z } from 'zod'
import { tempDocumentNameValidator } from './document'
import { autreAvisTypeIdValidator, avisStatutIdValidator, avisTypeIdSansAutreValidator, avisVisibilityIdValidator } from './static/avisTypes'
import { FlattenEtape, GraphqlEtape } from './etape-form'
import { sectionDureeIds } from './static/titresTypes_demarchesTypes_etapesTypes/sections'

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

export const etapeTypeEtapeStatutWithMainStepValidator = z.record(etapeTypeIdValidator, z.object({ etapeStatutIds: z.array(etapeStatutIdValidator), mainStep: z.boolean() }))
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

export const getEtapeDocumentsByEtapeIdValidator = z.object({
  etapeDocuments: z.array(etapeDocumentValidator),
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
export const regularEtapeAvisValidator = commonEtapeAvisValidator.extend({
  avis_type_id: avisTypeIdSansAutreValidator,
  description: z.string(),
})
export const autreEtapeAvisValidator = commonEtapeAvisValidator.extend({
  avis_type_id: autreAvisTypeIdValidator,
  description: z.string().min(1),
})
export const etapeAvisValidator = z.discriminatedUnion('avis_type_id', [regularEtapeAvisValidator, autreEtapeAvisValidator])
export type EtapeAvis = z.infer<typeof etapeAvisValidator>

// L'étape (input de modification)
const tempDocumentName = {
  temp_document_name: tempDocumentNameValidator.optional(),
}
const etapeAvisWithFileModificationValidator = z.discriminatedUnion('avis_type_id', [regularEtapeAvisValidator.extend(tempDocumentName), autreEtapeAvisValidator.extend(tempDocumentName)])
export type EtapeAvisWithFileModification = z.infer<typeof etapeAvisWithFileModificationValidator>

// L'étape (input de création)
const regularEtapeAvisWithoutIdValidator = regularEtapeAvisValidator.omit({ id: true, has_file: true })
const autreEtapeAvisWithoutIdValidator = autreEtapeAvisValidator.omit({ id: true, has_file: true })
export const etapeAvisWithoutIdValidator = z.discriminatedUnion('avis_type_id', [regularEtapeAvisWithoutIdValidator, autreEtapeAvisWithoutIdValidator])

export const tempEtapeAvisValidator = z.discriminatedUnion('avis_type_id', [regularEtapeAvisWithoutIdValidator.extend(tempDocumentName), autreEtapeAvisWithoutIdValidator.extend(tempDocumentName)])
export type TempEtapeAvis = z.infer<typeof tempEtapeAvisValidator>

// Divers inputs de fonctions externes
export const getEtapeAvisByEtapeIdValidator = z.array(etapeAvisValidator)

export type GetEtapeAvisByEtapeId = z.infer<typeof getEtapeAvisByEtapeIdValidator>

export const etapeAvisModificationValidator = z.union([etapeAvisWithFileModificationValidator, tempEtapeAvisValidator])
export type EtapeAvisModification = z.infer<typeof etapeAvisModificationValidator>

export const tempEtapeDocumentDescriptionOptionnelleValidator = etapeDocumentDescriptionOptionnelleValidator.omit({ id: true }).extend({ temp_document_name: tempDocumentNameValidator })
export const tempEtapeDocumentDescriptionObligatoireValidator = etapeDocumentDescriptionObligatoireValidator.omit({ id: true }).extend({ temp_document_name: tempDocumentNameValidator })
export const tempEtapeDocumentValidator = z.discriminatedUnion('etape_document_type_id', [tempEtapeDocumentDescriptionOptionnelleValidator, tempEtapeDocumentDescriptionObligatoireValidator])
export type TempEtapeDocument = z.infer<typeof tempEtapeDocumentValidator>

const etapeDocumentDescriptionOptionnelleWithFileModificationValidator = etapeDocumentDescriptionOptionnelleValidator.extend({ temp_document_name: tempDocumentNameValidator.optional() })
const etapeDocumentDescriptionObligatoireWithFileModificationValidator = etapeDocumentDescriptionObligatoireValidator.extend({ temp_document_name: tempDocumentNameValidator.optional() })
const etapeDocumentWithFileModificationValidator = z.union([etapeDocumentDescriptionOptionnelleWithFileModificationValidator, etapeDocumentDescriptionObligatoireWithFileModificationValidator])
export type EtapeDocumentWithFileModification = z.infer<typeof etapeDocumentWithFileModificationValidator>
export const etapeDocumentModificationValidator = z.union([etapeDocumentWithFileModificationValidator, tempEtapeDocumentValidator])
export type EtapeDocumentModification = z.infer<typeof etapeDocumentModificationValidator>

export const etapeNoteValidator = z.object({ valeur: z.string(), is_avertissement: z.boolean() })
export type EtapeNote = z.infer<typeof etapeNoteValidator>

export const getStatutId = (etape: Pick<FlattenEtape, 'date' | 'contenu' | 'typeId' | 'statutId'>, currentDate: CaminoDate): EtapeStatutId => {
  if (!isEtapeWithAutomaticStatuts(etape.typeId)) {
    return etape.statutId
  }

  const duree = etape.contenu[sectionDureeIds[etape.typeId]]?.['duree']?.value ?? 0

  if (isBefore(currentDate, etape.date)) {
    return ETAPES_STATUTS.PROGRAMME
  } else if (isBefore(currentDate, dateAddDays(etape.date, z.number().parse(duree)))) {
    return ETAPES_STATUTS.EN_COURS
  } else {
    return ETAPES_STATUTS.TERMINE
  }
}
