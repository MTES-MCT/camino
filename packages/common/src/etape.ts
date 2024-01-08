import { CaminoDate } from './date.js'
import { EntrepriseId, documentIdValidator } from './entreprise.js'
import { AdministrationId } from './static/administrations.js'
import { DocumentTypeId, documentTypeIdValidator } from './static/documentsTypes.js'
import { etapeStatutIdValidator } from './static/etapesStatuts.js'
import { EtapeTypeId, etapeTypeIdValidator } from './static/etapesTypes.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'
import { z } from 'zod'

export const etapeIdValidator = z.string().brand<'EtapeId'>()
export type EtapeId = z.infer<typeof etapeIdValidator>

export const etapeSlugValidator = z.string().brand<'EtapeSlug'>()
export type EtapeSlug = z.infer<typeof etapeSlugValidator>

const etapeIdOrSlugValidator = z.union([etapeIdValidator, etapeSlugValidator])
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
  points: any[]
  surface: number
  dateDebut: CaminoDate | null
  administrations?: AdministrationId[]
  documents?: CaminoDocument[]
  justificatifs?: unknown[]
  communes?: string[]
  geojsonPoints?: unknown[]
  geojsonMultiPolygon?: unknown[]
  notes: null | string
} & ({ duree: number; dateFin: CaminoDate | undefined } | { duree: number | undefined; dateFin: CaminoDate | null })

export type EtapeWithHeritage<T extends Pick<EtapeBase, 'type' | 'date'>> = T & {
  heritageProps: {
    [key in keyof Omit<
      T,
      'type' | 'heritageProps' | 'contenu' | 'date' | 'administrations' | 'documents' | 'justificatifs' | 'communes' | 'geojsonPoints' | 'geojsonMultiPolygon' | 'id'
    >]: HeritageProp<Pick<T, 'type' | 'date' | key>>
  }
}

export type Etape = EtapeWithHeritage<EtapeBase>
export type EtapeFondamentale = EtapeWithHeritage<Omit<EtapeBase, 'points' | 'surface'>>

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
