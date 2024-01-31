import { z } from 'zod'
import { Expect, isTrue } from './typescript-tools'

export const ETAPE_HERITAGE_PROPS = ['titulaires', 'amodiataires', 'dateDebut', 'dateFin', 'duree', 'substances', 'perimetre'] as const

export const etapeHeritagePropsValidator = z.enum(ETAPE_HERITAGE_PROPS)

export type EtapeHeritageProps = z.infer<typeof etapeHeritagePropsValidator>

export const isHeritageProps = (value: string): value is EtapeHeritageProps => ETAPE_HERITAGE_PROPS.includes(value)


// FIXME tests
export const mappingHeritagePropsNameEtapePropsName = {
    'titulaires': ['titulaires'],
    'amodiataires': ['amodiataires'],
    'dateDebut': ['dateDebut'],
    'dateFin': ['dateFin'],
    'duree': ['duree'],
    'substances':['substances'],
    'perimetre': ['geojson4326Perimetre', 'geojson4326Points', 'surface']
} as const satisfies Record<EtapeHeritageProps, Readonly<string[]>>

// isTrue<Expect<typeof mappingHeritagePropsNameEtapePropsName, keyof Etape>>
  
export type MappingHeritagePropsNameEtapePropsName = typeof mappingHeritagePropsNameEtapePropsName
  