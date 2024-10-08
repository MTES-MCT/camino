import Decimal from 'decimal.js'
import { z } from 'zod'
const IDS = ['deg', 'gon', 'km3', 'm3a', 'm3x', 'met', 'mgr', 'mkc', 'mkg', 'mtc', 'mtk', 'mtt', 'txa', 'vmd', 'm3h', 'kwa'] as const

export const UNITE_IDS = {
  degré: 'deg',
  grade: 'gon',
  'kilomètre cube': 'km3',
  'mètre cube par heure': 'm3h',
  'mètre cube par an': 'm3a',
  'mètre cube': 'm3x',
  mètre: 'met',
  gramme: 'mgr',
  quintal: 'mkc',
  kilogramme: 'mkg',
  'centaine de tonnes': 'mtc',
  'millier de tonnes': 'mtk',
  tonne: 'mtt',
  'tonnes par an': 'txa',
  '100 000 mètres cubes': 'vmd',
  kilowatt: 'kwa',
} as const satisfies Record<string, UniteId>

export interface Unite<T = UniteId> {
  id: T
  nom: string
  symbole: string
  referenceUniteId: null | UniteId
  referenceUniteRatio: null | number
  uniteFiscaliteId?: UniteFiscaliteId
}

type UniteFiscaliteId = 'kg' | '100kg' | 't' | '100t' | 'kt' | '100km3'

export const uniteIdValidator = z.enum(IDS)
export type UniteId = z.infer<typeof uniteIdValidator>

export const Unites: { [key in UniteId]: Unite<key> } = {
  deg: { id: 'deg', nom: 'degré', symbole: 'º', referenceUniteId: null, referenceUniteRatio: null },
  gon: { id: 'gon', nom: 'grade', symbole: 'gon', referenceUniteId: 'deg', referenceUniteRatio: 0.9 },
  km3: { id: 'km3', nom: 'kilomètre cube', symbole: 'km³', referenceUniteId: 'm3x', referenceUniteRatio: 1000000000 },
  m3h: { id: 'm3h', nom: 'mètre cube par heure', symbole: 'm³/h', referenceUniteId: null, referenceUniteRatio: null },
  m3a: { id: 'm3a', nom: 'mètre cube par an', symbole: 'm³/an', referenceUniteId: null, referenceUniteRatio: null },
  m3x: { id: 'm3x', nom: 'mètre cube', symbole: 'm³', referenceUniteId: null, referenceUniteRatio: null },
  met: { id: 'met', nom: 'mètre', symbole: 'm', referenceUniteId: null, referenceUniteRatio: null },
  mgr: { id: 'mgr', nom: 'gramme', symbole: 'g', referenceUniteId: 'mkg', referenceUniteRatio: 0.001 },
  mkc: { id: 'mkc', nom: 'quintal', symbole: 'x 100 kg', referenceUniteId: 'mkg', referenceUniteRatio: 100, uniteFiscaliteId: '100kg' },
  mkg: { id: 'mkg', nom: 'kilogramme', symbole: 'kg', referenceUniteId: null, referenceUniteRatio: null, uniteFiscaliteId: 'kg' },
  mtc: { id: 'mtc', nom: 'centaine de tonnes', symbole: 'x 100 t', referenceUniteId: 'mkg', referenceUniteRatio: 100000, uniteFiscaliteId: '100t' },
  mtk: { id: 'mtk', nom: 'millier de tonnes', symbole: 'x 1000 t', referenceUniteId: 'mkg', referenceUniteRatio: 1000000, uniteFiscaliteId: 'kt' },
  mtt: { id: 'mtt', nom: 'tonne', symbole: 't', referenceUniteId: 'mkg', referenceUniteRatio: 1000, uniteFiscaliteId: 't' },
  txa: { id: 'txa', nom: 'tonnes par an', symbole: 't/an', referenceUniteId: null, referenceUniteRatio: null },
  vmd: { id: 'vmd', nom: '100 000 mètres cubes', symbole: 'x 100 000 m³', referenceUniteId: 'm3x', referenceUniteRatio: 100000, uniteFiscaliteId: '100km3' },
  kwa: { id: 'kwa', nom: 'kilowatt', symbole: 'kW', referenceUniteId: null, referenceUniteRatio: null },
}

export const fromUniteFiscaleToUnite = (unite: UniteId, value: Decimal): Decimal => {
  const uniteRef = Unites[unite]
  if (uniteRef.referenceUniteRatio !== null) {
    return value.dividedBy(uniteRef.referenceUniteRatio)
  }

  return value
}

export const UNITES = Object.values(Unites)
