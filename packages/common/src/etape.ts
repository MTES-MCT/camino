import { CaminoDate, caminoDateValidator } from './date.js'
import { EntrepriseId } from './entreprise.js'
import { EtapeHeritageProps, MappingHeritagePropsNameEtapePropsName } from './heritage.js'
import { DOCUMENTS_TYPES_IDS, documentTypeIdValidator } from './static/documentsTypes.js'
import { EtapeStatutId, etapeStatutIdValidator } from './static/etapesStatuts.js'
import { EtapeTypeId, etapeTypeIdValidator } from './static/etapesTypes.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'
import { z } from 'zod'
import { tempDocumentNameValidator } from './document.js'
import { DeepReadonly, OmitDistributive } from './typescript-tools.js'
import { getSections } from './static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { ElementWithValue } from './sections.js'
import { DemarcheTypeId } from './static/demarchesTypes.js'
import { TitreTypeId } from './static/titresTypes.js'
import { User, isEntrepriseOrBureauDEtude } from './roles.js'
import { avisStatutIdValidator, avisTypeIdValidator } from './static/avisTypes.js'
import { GraphqlEtape } from './etape-form.js'
import { EtapeComplete } from './permissions/titres-etapes.js'

export const etapeIdValidator = z.string().brand<'EtapeId'>()
export type EtapeId = z.infer<typeof etapeIdValidator>

export const etapeSlugValidator = z.string().brand<'EtapeSlug'>()
export type EtapeSlug = z.infer<typeof etapeSlugValidator>

export const etapeIdOrSlugValidator = z.union([etapeIdValidator, etapeSlugValidator])
export type EtapeIdOrSlug = z.infer<typeof etapeIdOrSlugValidator>

export type HeritageProp<T> = { actif: boolean; etape?: T | null }

type EtapePropsFromHeritagePropName<key extends EtapeHeritageProps> = MappingHeritagePropsNameEtapePropsName[key][number]

export type EtapeWithHeritage = InternalEtapeWithHeritage<EtapeHeritageProps, Omit<GraphqlEtape, 'typeId' | 'date' | 'statutId'> & { typeId: EtapeTypeId; date: CaminoDate; statutId: EtapeStatutId }>

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

export const etapeDocumentValidator = z.object({
  id: etapeDocumentIdValidator,
  description: z.string().nullable(),
  etape_document_type_id: documentTypeIdValidator,
  public_lecture: z.boolean().default(false),
  entreprises_lecture: z.boolean().default(false),
})

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


export const etapeAvisIdValidator = z.string().brand('EtapeAvis')
const etapeAvisValidator = z.object({
  id: etapeAvisIdValidator,
  avis_type_id: avisTypeIdValidator,
  date: caminoDateValidator,
  avis_statut_id: avisStatutIdValidator,
  description: z.string()
})
export type EtapeAvis = z.infer<typeof etapeAvisValidator>

export const tempEtapeAvisValidator = etapeAvisValidator.omit({ id: true }).extend({ temp_document_name: tempDocumentNameValidator })
export type TempEtapeAvis = z.infer<typeof tempEtapeAvisValidator>

const etapeAvisWithFileModificationValidator = etapeAvisValidator.extend({ temp_document_name: tempDocumentNameValidator.optional() })
export type EtapeAvisWithFileModification = z.infer<typeof etapeAvisWithFileModificationValidator>
export const etapeAvisModificationValidator = z.union([etapeAvisWithFileModificationValidator, tempEtapeAvisValidator])
export type EtapeAvisModification = z.infer<typeof etapeAvisModificationValidator>

export const needAslAndDae = (
  tde: {
    etapeTypeId: EtapeTypeId
    demarcheTypeId: DemarcheTypeId
    titreTypeId: TitreTypeId
  },
  isBrouillon: boolean,
  user: User
): boolean => {
  return tde.etapeTypeId === 'mfr' && tde.demarcheTypeId === 'oct' && tde.titreTypeId === 'axm' && isEntrepriseOrBureauDEtude(user) && isBrouillon
}

export const tempEtapeDocumentValidator = etapeDocumentValidator.omit({ id: true }).extend({ temp_document_name: tempDocumentNameValidator })
export type TempEtapeDocument = z.infer<typeof tempEtapeDocumentValidator>

const etapeDocumentWithFileModificationValidator = etapeDocumentValidator.extend({ temp_document_name: tempDocumentNameValidator.optional() })
export type EtapeDocumentWithFileModification = z.infer<typeof etapeDocumentWithFileModificationValidator>
export const etapeDocumentModificationValidator = z.union([etapeDocumentWithFileModificationValidator, tempEtapeDocumentValidator])
export type EtapeDocumentModification = z.infer<typeof etapeDocumentModificationValidator>

export const documentComplementaireDaeEtapeDocumentModificationValidator = etapeDocumentModificationValidator.and(documentComplementaireObligatoireDAEValidator)
export type DocumentComplementaireDaeEtapeDocumentModification = z.infer<typeof documentComplementaireDaeEtapeDocumentModificationValidator>

export const documentComplementaireAslEtapeDocumentModificationValidator = etapeDocumentModificationValidator.and(documentComplementaireObligatoireASLValidator)
export type DocumentComplementaireAslEtapeDocumentModification = z.infer<typeof documentComplementaireAslEtapeDocumentModificationValidator>
