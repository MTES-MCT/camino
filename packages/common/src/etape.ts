import { CaminoDate } from './date.js'
import { EntrepriseId } from './entreprise.js'
import { AdministrationId } from './static/administrations.js'
import { DocumentTypeId } from './static/documentsTypes.js'
import { EtapeTypeId } from './static/etapesTypes.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'

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
  dateDebut: CaminoDate
  administrations?: AdministrationId[]
  documents?: CaminoDocument[]
  justificatifs?: unknown[]
  communes?: string[]
  geojsonPoints?: unknown[]
  geojsonMultiPolygon?: unknown[]
} & ({ duree: number; dateFin: CaminoDate | undefined } | { duree: number | undefined; dateFin: CaminoDate })

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
