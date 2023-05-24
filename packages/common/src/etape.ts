import { CaminoDate } from './date.js'
import { DemarcheId } from './demarche.js'
import { EntrepriseId } from './entreprise.js'
import { AdministrationId } from './static/administrations.js'
import { DemarcheTypeId } from './static/demarchesTypes.js'
import { DocumentTypeId } from './static/documentsTypes.js'
import { etapeStatutIdValidator } from './static/etapesStatuts.js'
import { EtapeTypeId, etapeTypeIdValidator } from './static/etapesTypes.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'
import { z } from 'zod'

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

export interface CaminoDocument {
  type: { id: DocumentTypeId }
}

type EtapeBase = {
  id: string
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
} & ({ duree: number; dateFin: CaminoDate | undefined } | { duree: number | undefined; dateFin: CaminoDate | null })

export type EtapeWithIncertitudesAndHeritage<T extends Pick<EtapeBase, 'type' | 'date'>> = T & {
  incertitudes: {
    [key in keyof Omit<
      T,
      'incertitudes' | 'type' | 'heritageProps' | 'contenu' | 'administrations' | 'documents' | 'justificatifs' | 'communes' | 'geojsonPoints' | 'geojsonMultiPolygon' | 'id'
    >]: boolean
  }
  heritageProps: {
    [key in keyof Omit<
      T,
      'incertitudes' | 'type' | 'heritageProps' | 'contenu' | 'date' | 'administrations' | 'documents' | 'justificatifs' | 'communes' | 'geojsonPoints' | 'geojsonMultiPolygon' | 'id'
    >]: HeritageProp<Pick<T, 'type' | 'date' | key> & { incertitudes: { [k in key]: boolean } }>
  }
}

export type Etape = EtapeWithIncertitudesAndHeritage<EtapeBase>
export type EtapeFondamentale = EtapeWithIncertitudesAndHeritage<Omit<EtapeBase, 'points' | 'surface'>>

export const etapeTypeEtapeStatutWithMainStepValidator = z.object({ etapeTypeId: etapeTypeIdValidator, etapeStatutId: etapeStatutIdValidator, mainStep: z.boolean() })
export type EtapeTypeEtapeStatutWithMainStep = z.infer<typeof etapeTypeEtapeStatutWithMainStepValidator>

export type CommonEtape = {
  titreDemarcheId: DemarcheId
  typeId: DemarcheTypeId
}
