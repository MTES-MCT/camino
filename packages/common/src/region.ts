export const REGION_IDS = {
  Guadeloupe: '01',
  Martinique: '02',
  Guyane: '03',
  'La Réunion': '04',
  Mayotte: '06',
  'Île-de-France': '11',
  'Centre-Val de Loire': '24',
  'Bourgogne-Franche-Comté': '27',
  Normandie: '28',
  'Hauts-de-France': '32',
  'Grand Est': '44',
  'Pays de la Loire': '52',
  Bretagne: '53',
  'Nouvelle-Aquitaine': '75',
  Occitanie: '76',
  'Auvergne-Rhône-Alpes': '84',
  "Provence-Alpes-Côte d'Azur": '93',
  Corse: '94'
} as const

export interface Region<T = RegionId> {
  id: T
  nom: string
  pays_id: string
}

export type RegionId = typeof REGION_IDS[keyof typeof REGION_IDS]

export const Regions: { [key in RegionId]: Region<key> } = {
  '01': {
    id: '01',
    nom: 'Guadeloupe',
    pays_id: 'GP'
  },
  '02': {
    id: '02',
    nom: 'Martinique',
    pays_id: 'MQ'
  },
  '03': {
    id: '03',
    nom: 'Guyane',
    pays_id: 'GF'
  },
  '04': {
    id: '04',
    nom: 'La Réunion',
    pays_id: 'RE'
  },
  '06': {
    id: '06',
    nom: 'Mayotte',
    pays_id: 'YT'
  },
  '11': {
    id: '11',
    nom: 'Île-de-France',
    pays_id: 'FR'
  },
  '24': {
    id: '24',
    nom: 'Centre-Val de Loire',
    pays_id: 'FR'
  },
  '27': {
    id: '27',
    nom: 'Bourgogne-Franche-Comté',
    pays_id: 'FR'
  },
  '28': {
    id: '28',
    nom: 'Normandie',
    pays_id: 'FR'
  },
  '32': {
    id: '32',
    nom: 'Hauts-de-France',
    pays_id: 'FR'
  },
  '44': {
    id: '44',
    nom: 'Grand Est',
    pays_id: 'FR'
  },
  '52': {
    id: '52',
    nom: 'Pays de la Loire',
    pays_id: 'FR'
  },
  '53': {
    id: '53',
    nom: 'Bretagne',
    pays_id: 'FR'
  },
  '75': {
    id: '75',
    nom: 'Nouvelle-Aquitaine',
    pays_id: 'FR'
  },
  '76': {
    id: '76',
    nom: 'Occitanie',
    pays_id: 'FR'
  },
  '84': {
    id: '84',
    nom: 'Auvergne-Rhône-Alpes',
    pays_id: 'FR'
  },
  '93': {
    id: '93',
    nom: "Provence-Alpes-Côte d'Azur",
    pays_id: 'FR'
  },
  '94': {
    id: '94',
    nom: 'Corse',
    pays_id: 'FR'
  }
}
