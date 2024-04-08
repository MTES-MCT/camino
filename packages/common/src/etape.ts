import { CaminoDate } from './date.js'
import { EntrepriseId } from './entreprise.js'
import { EtapeHeritageProps, MappingHeritagePropsNameEtapePropsName } from './heritage.js'
import { AdministrationId } from './static/administrations.js'
import { DocumentTypeId, documentTypeIdValidator } from './static/documentsTypes.js'
import { EtapeStatutId, etapeStatutIdValidator } from './static/etapesStatuts.js'
import { EtapeTypeId, etapeTypeIdValidator } from './static/etapesTypes.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'
import { z } from 'zod'
import { FeatureCollectionForages, FeatureCollectionPoints, FeatureMultiPolygon } from './perimetre.js'
import { KM2 } from './number.js'
import { GeoSystemeId } from './static/geoSystemes.js'
import { tempDocumentNameValidator } from './document.js'
import { ElementWithValue } from './sections.js'

export const etapeIdValidator = z.string().brand<'EtapeId'>()
export type EtapeId = z.infer<typeof etapeIdValidator>

export const etapeSlugValidator = z.string().brand<'EtapeSlug'>()
export type EtapeSlug = z.infer<typeof etapeSlugValidator>

export const etapeIdOrSlugValidator = z.union([etapeIdValidator, etapeSlugValidator])
export type EtapeIdOrSlug = z.infer<typeof etapeIdOrSlugValidator>

export type HeritageProp<T> = { actif: boolean; etape?: T }

export interface EtapeEntreprise {
  id: EntrepriseId
  operateur: boolean
}

// TODO 2023-06-14 Utiliser seulement par l’ui, à bouger dedans
export interface CaminoDocument {
  typeId: DocumentTypeId
}

export type Etape = {
  id: EtapeId
  contenu: Record<string, Record<string, ElementWithValue['value']>>
  date: CaminoDate
  typeId: EtapeTypeId | null
  statutId: EtapeStatutId | null
  substances: SubstanceLegaleId[]
  titulaires: EtapeEntreprise[]
  amodiataires: EtapeEntreprise[]
  administrations?: AdministrationId[]
  communes?: string[]

  geojson4326Perimetre: FeatureMultiPolygon | null | undefined
  geojson4326Points: FeatureCollectionPoints | null | undefined
  geojsonOriginePerimetre: FeatureMultiPolygon | null | undefined
  geojsonOriginePoints: FeatureCollectionPoints | null | undefined
  geojsonOrigineGeoSystemeId: GeoSystemeId | null | undefined
  geojson4326Forages: FeatureCollectionForages | null | undefined
  geojsonOrigineForages: FeatureCollectionForages | null | undefined
  surface: KM2 | null | undefined

  notes: null | string
  duree: number
  dateDebut: CaminoDate | null
  dateFin: CaminoDate | undefined | null
}

export type EtapePropsFromHeritagePropName<key extends EtapeHeritageProps> = MappingHeritagePropsNameEtapePropsName[key][number]

export type FullEtapeHeritage = EtapeWithHeritage<EtapeHeritageProps, Omit<Etape, 'typeId'> & { typeId: EtapeTypeId }>

export type HeritageContenu = Record<string, Record<string, HeritageProp<Pick<FullEtapeHeritage, 'contenu' | 'typeId' | 'date'>>>>
type EtapeWithHeritage<HeritagePropsKeys extends EtapeHeritageProps, T extends Pick<Etape, 'date' | EtapePropsFromHeritagePropName<HeritagePropsKeys>> & { typeId: EtapeTypeId }> = T & {
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

export const tempEtapeDocumentValidator = etapeDocumentValidator.omit({ id: true }).extend({ temp_document_name: tempDocumentNameValidator })
export type TempEtapeDocument = z.infer<typeof tempEtapeDocumentValidator>

const etapeDocumentWithFileModificationValidator = etapeDocumentValidator.extend({ temp_document_name: tempDocumentNameValidator.optional() })
export type EtapeDocumentWithFileModification = z.infer<typeof etapeDocumentWithFileModificationValidator>
export const etapeDocumentModificationValidator = z.union([etapeDocumentWithFileModificationValidator, tempEtapeDocumentValidator])
export type EtapeDocumentModification = z.infer<typeof etapeDocumentModificationValidator>
