import { z } from "zod"

export const ETAPE_HERITAGE_PROPS = ['titulaires', 'amodiataires', 'dateDebut', 'dateFin', 'duree', 'perimetre', 'substances'] as const

export const etapeHeritagePropsValidator = z.enum(ETAPE_HERITAGE_PROPS)

export type EtapeHeritageProps = z.infer<typeof etapeHeritagePropsValidator>


export const isHeritageProps = (value: string): value is EtapeHeritageProps => ETAPE_HERITAGE_PROPS.includes(value)