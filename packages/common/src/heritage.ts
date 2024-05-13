import { z } from 'zod'

export const ETAPE_HERITAGE_PROPS = ['titulaires', 'amodiataires', 'dateDebut', 'dateFin', 'duree', 'substances', 'perimetre'] as const

export const etapeHeritagePropsValidator = z.enum(ETAPE_HERITAGE_PROPS)

export type EtapeHeritageProps = z.infer<typeof etapeHeritagePropsValidator>

export const isHeritageProps = (value: string): value is EtapeHeritageProps => ETAPE_HERITAGE_PROPS.includes(value)

const mappingHeritagePropsNameEtapePropsName = {
  titulaires: ['titulaireIds'],
  amodiataires: ['amodiataireIds'],
  dateDebut: ['dateDebut'],
  dateFin: ['dateFin'],
  duree: ['duree'],
  substances: ['substances'],
  perimetre: ['geojson4326Perimetre', 'geojson4326Points', 'surface', 'geojsonOriginePerimetre', 'geojsonOriginePoints', 'geojsonOrigineGeoSystemeId', 'geojson4326Forages', 'geojsonOrigineForages'],
  contenu: ['contenu'],
} as const satisfies Record<EtapeHeritageProps | 'contenu', Readonly<string[]>>

export type MappingHeritagePropsNameEtapePropsName = typeof mappingHeritagePropsNameEtapePropsName
