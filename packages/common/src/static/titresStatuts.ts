import { Definition } from '../definition.js'
import { z } from 'zod'

const TitresStatutKeys = ['dmc', 'dmi', 'ech', 'ind', 'mod', 'val', 'sup'] as const

export const TitresStatutIds = {
  DemandeClassee: 'dmc',
  DemandeInitiale: 'dmi',
  Echu: 'ech',
  Indetermine: 'ind',
  ModificationEnInstance: 'mod',
  SurvieProvisoire: 'sup',
  Valide: 'val',
} as const satisfies Record<string, (typeof TitresStatutKeys)[number]>

export const titreStatutIdValidator = z.enum(TitresStatutKeys)
export type TitreStatutId = z.infer<typeof titreStatutIdValidator>

export const TitresStatuts: {
  [key in TitreStatutId]: Pick<Definition<key>, 'id' | 'nom'>
} = {
  dmc: {
    id: 'dmc',
    nom: 'demande classée',
  },
  dmi: {
    id: 'dmi',
    nom: 'demande initiale',
  },
  ech: {
    id: 'ech',
    nom: 'échu',
  },
  ind: {
    id: 'ind',
    nom: 'indéterminé',
  },
  mod: {
    id: 'mod',
    nom: 'valide - modification en instance',
  },
  sup: {
    id: 'sup',
    nom: 'valide - survie provisoire',
  },
  val: {
    id: 'val',
    nom: 'valide',
  },
} as const satisfies {
  [key in TitreStatutId]: Omit<Definition<key>, 'ordre' | 'description'>
}

const TITRES_STATUTS_IDS = Object.values(TitresStatutIds)

export const isTitreStatutId = (value: string): value is TitreStatutId => TITRES_STATUTS_IDS.includes(value)

export const titresStatutsArray = Object.values(TitresStatuts)

export const isTitreValide = (titreStatutId: TitreStatutId) => [TitresStatutIds.Valide, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire].includes(titreStatutId)
