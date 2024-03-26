import { CaminoDate } from './date.js'
import { EntrepriseId } from './entreprise.js'
import { EtapeHeritageProps, MappingHeritagePropsNameEtapePropsName } from './heritage.js'
import { AdministrationId } from './static/administrations.js'
import { DocumentTypeId, documentTypeIdValidator } from './static/documentsTypes.js'
import { etapeStatutIdValidator } from './static/etapesStatuts.js'
import { EtapeTypeId, etapeTypeIdValidator } from './static/etapesTypes.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'
import { z } from 'zod'
import { FeatureCollectionForages, FeatureCollectionPoints, FeatureMultiPolygon } from './perimetre.js'
import { KM2 } from './number.js'
import { GeoSystemeId } from './static/geoSystemes.js'
import { tempDocumentNameValidator } from './document.js'

export const etapeIdValidator = z.string().brand<'EtapeId'>()
export type EtapeId = z.infer<typeof etapeIdValidator>

export const etapeSlugValidator = z.string().brand<'EtapeSlug'>()
export type EtapeSlug = z.infer<typeof etapeSlugValidator>

export const etapeIdOrSlugValidator = z.union([etapeIdValidator, etapeSlugValidator])
export type EtapeIdOrSlug = z.infer<typeof etapeIdOrSlugValidator>

export type HeritageProp<T> =
  | {
      actif: true
      etape: T
    }
  | { actif: false; etape?: T }

export interface EtapeEntreprise {
  id: EntrepriseId
  operateur: boolean
}

// TODO 2023-06-14 Utiliser seulement par l’ui, à bouger dedans
export interface CaminoDocument {
  typeId: DocumentTypeId
}

type EtapeBase = {
  id: EtapeId
  contenu: { [key: string]: unknown }
  date: CaminoDate
  typeId: EtapeTypeId
  substances: SubstanceLegaleId[]
  titulaires: EtapeEntreprise[]
  amodiataires: EtapeEntreprise[]
  dateDebut: CaminoDate | null
  administrations?: AdministrationId[]
  communes?: string[]

  geojson4326Perimetre?: FeatureMultiPolygon | null
  geojson4326Points?: FeatureCollectionPoints | null
  geojsonOriginePerimetre?: FeatureMultiPolygon | null
  geojsonOriginePoints?: FeatureCollectionPoints | null
  geojsonOrigineGeoSystemeId?: GeoSystemeId | null
  geojson4326Forages?: FeatureCollectionForages | null
  geojsonOrigineForages?: FeatureCollectionForages | null
  surface?: KM2 | null

  notes: null | string
} & ({ duree: number; dateFin: CaminoDate | undefined } | { duree: number | undefined; dateFin: CaminoDate | null })

type EtapePropsFromHeritagePropName<key extends EtapeHeritageProps> = MappingHeritagePropsNameEtapePropsName[key][number]

export type EtapeWithHeritage<K extends keyof MappingHeritagePropsNameEtapePropsName, T extends Pick<EtapeBase, 'typeId' | 'date' | EtapePropsFromHeritagePropName<K>>> = T & {
  heritageProps: {
    [key in K]: HeritageProp<Pick<T, 'typeId' | 'date' | EtapePropsFromHeritagePropName<K>>>
  }
}

export type Etape = EtapeWithHeritage<keyof MappingHeritagePropsNameEtapePropsName, EtapeBase>
export type EtapeFondamentale = Etape

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