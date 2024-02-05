import { CaminoDate } from './date.js'
import { EntrepriseId, documentIdValidator } from './entreprise.js'
import { EtapeHeritageProps, MappingHeritagePropsNameEtapePropsName } from './heritage.js'
import { AdministrationId } from './static/administrations.js'
import { DocumentTypeId, documentTypeIdValidator } from './static/documentsTypes.js'
import { etapeStatutIdValidator } from './static/etapesStatuts.js'
import { EtapeTypeId, etapeTypeIdValidator } from './static/etapesTypes.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'
import { z } from 'zod'
import { FeatureCollectionPoints, FeatureMultiPolygon } from './perimetre.js'
import { KM2 } from './number.js'

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
  type: { id: EtapeTypeId; nom: string }
  substances: SubstanceLegaleId[]
  titulaires: EtapeEntreprise[]
  amodiataires: EtapeEntreprise[]
  dateDebut: CaminoDate | null
  administrations?: AdministrationId[]
  documents?: CaminoDocument[]
  justificatifs?: unknown[]
  communes?: string[]

  geojson4326Perimetre?: FeatureMultiPolygon | null
  geojson4326Points?: FeatureCollectionPoints | null
  surface?: KM2 | null

  notes: null | string
} & ({ duree: number; dateFin: CaminoDate | undefined } | { duree: number | undefined; dateFin: CaminoDate | null })

type EtapePropsFromHeritagePropName<key extends EtapeHeritageProps> = MappingHeritagePropsNameEtapePropsName[key][number]

export type EtapeWithHeritage<K extends keyof MappingHeritagePropsNameEtapePropsName, T extends Pick<EtapeBase, 'type' | 'date' | EtapePropsFromHeritagePropName<K>>> = T & {
  heritageProps: {
    [key in K]: HeritageProp<Pick<T, 'type' | 'date' | EtapePropsFromHeritagePropName<K>>>
  }
}

export type Etape = EtapeWithHeritage<keyof MappingHeritagePropsNameEtapePropsName, EtapeBase>
export type EtapeFondamentale = Etape

export const etapeTypeEtapeStatutWithMainStepValidator = z.object({ etapeTypeId: etapeTypeIdValidator, etapeStatutId: etapeStatutIdValidator, mainStep: z.boolean() })
export type EtapeTypeEtapeStatutWithMainStep = z.infer<typeof etapeTypeEtapeStatutWithMainStepValidator>

export const etapeDocumentValidator = z.object({
  id: documentIdValidator,
  description: z.string().nullable(),
  document_type_id: documentTypeIdValidator,
  public_lecture: z.boolean().default(false),
  entreprises_lecture: z.boolean().default(false),
})

export type EtapeDocument = z.infer<typeof etapeDocumentValidator>
