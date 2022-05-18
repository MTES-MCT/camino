export const UNITE_IDS = {
  degré: 'deg',
  grade: 'gon',
  'kilomètre cube': 'km3',
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
  '100 000 mètres cubes': 'vmd'
} as const

export interface Unite<T = UniteId> {
  id: T
  nom: string
  symbole: string
  referenceUniteId: null | UniteId
  referenceUniteRatio: null | number
}

export type UniteId = typeof UNITE_IDS[keyof typeof UNITE_IDS]

export const Unites: { [key in UniteId]: Unite<key> } = {
  deg: {
    id: 'deg',
    nom: 'degré',
    symbole: 'º',
    referenceUniteId: null,
    referenceUniteRatio: null
  },
  gon: {
    id: 'gon',
    nom: 'grade',
    symbole: 'gon',
    referenceUniteId: 'deg',
    referenceUniteRatio: 0.9
  },
  km3: {
    id: 'km3',
    nom: 'kilomètre cube',
    symbole: 'km³',
    referenceUniteId: 'm3x',
    referenceUniteRatio: 1000000000
  },
  m3a: {
    id: 'm3a',
    nom: 'mètre cube par an',
    symbole: 'm³ / an',
    referenceUniteId: null,
    referenceUniteRatio: null
  },
  m3x: {
    id: 'm3x',
    nom: 'mètre cube',
    symbole: 'm³',
    referenceUniteId: null,
    referenceUniteRatio: null
  },
  met: {
    id: 'met',
    nom: 'mètre',
    symbole: 'm',
    referenceUniteId: null,
    referenceUniteRatio: null
  },
  mgr: {
    id: 'mgr',
    nom: 'gramme',
    symbole: 'g',
    referenceUniteId: 'mkg',
    referenceUniteRatio: 0.001
  },
  mkc: {
    id: 'mkc',
    nom: 'quintal',
    symbole: 'x 100 kg',
    referenceUniteId: 'mkg',
    referenceUniteRatio: 100
  },
  mkg: {
    id: 'mkg',
    nom: 'kilogramme',
    symbole: 'kg',
    referenceUniteId: null,
    referenceUniteRatio: null
  },
  mtc: {
    id: 'mtc',
    nom: 'centaine de tonnes',
    symbole: 'x 100 t',
    referenceUniteId: 'mkg',
    referenceUniteRatio: 100000
  },
  mtk: {
    id: 'mtk',
    nom: 'millier de tonnes',
    symbole: 'x 1000 t',
    referenceUniteId: 'mkg',
    referenceUniteRatio: 1000000
  },
  mtt: {
    id: 'mtt',
    nom: 'tonne',
    symbole: 't',
    referenceUniteId: 'mkg',
    referenceUniteRatio: 1000
  },
  txa: {
    id: 'txa',
    nom: 'tonnes par an',
    symbole: 't / an',
    referenceUniteId: null,
    referenceUniteRatio: null
  },
  vmd: {
    id: 'vmd',
    nom: '100 000 mètres cubes',
    symbole: 'x 100 000 m³',
    referenceUniteId: 'm3x',
    referenceUniteRatio: 100000
  }
}
