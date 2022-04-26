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
  cheflieu_id: string
}

export type RegionId = typeof REGION_IDS[keyof typeof REGION_IDS]

export const Regions: { [key in RegionId]: Region<key> } = {
  '01': {
    id: '01',
    nom: 'Guadeloupe',
    pays_id: 'GP',
    cheflieu_id: '97105'
  },
  '02': {
    id: '02',
    nom: 'Martinique',
    pays_id: 'MQ',
    cheflieu_id: '97209'
  },
  '03': {
    id: '03',
    nom: 'Guyane',
    pays_id: 'GF',
    cheflieu_id: '97302'
  },
  '04': {
    id: '04',
    nom: 'La Réunion',
    pays_id: 'RE',
    cheflieu_id: '97411'
  },
  '06': {
    id: '06',
    nom: 'Mayotte',
    pays_id: 'YT',
    cheflieu_id: '97608'
  },
  '11': {
    id: '11',
    nom: 'Île-de-France',
    pays_id: 'FR',
    cheflieu_id: '75056'
  },
  '24': {
    id: '24',
    nom: 'Centre-Val de Loire',
    pays_id: 'FR',
    cheflieu_id: '45234'
  },
  '27': {
    id: '27',
    nom: 'Bourgogne-Franche-Comté',
    pays_id: 'FR',
    cheflieu_id: '21231'
  },
  '28': {
    id: '28',
    nom: 'Normandie',
    pays_id: 'FR',
    cheflieu_id: '76540'
  },
  '32': {
    id: '32',
    nom: 'Hauts-de-France',
    pays_id: 'FR',
    cheflieu_id: '59350'
  },
  '44': {
    id: '44',
    nom: 'Grand Est',
    pays_id: 'FR',
    cheflieu_id: '67482'
  },
  '52': {
    id: '52',
    nom: 'Pays de la Loire',
    pays_id: 'FR',
    cheflieu_id: '44109'
  },
  '53': {
    id: '53',
    nom: 'Bretagne',
    pays_id: 'FR',
    cheflieu_id: '35238'
  },
  '75': {
    id: '75',
    nom: 'Nouvelle-Aquitaine',
    pays_id: 'FR',
    cheflieu_id: '33063'
  },
  '76': {
    id: '76',
    nom: 'Occitanie',
    pays_id: 'FR',
    cheflieu_id: '31555'
  },
  '84': {
    id: '84',
    nom: 'Auvergne-Rhône-Alpes',
    pays_id: 'FR',
    cheflieu_id: '69123'
  },
  '93': {
    id: '93',
    nom: "Provence-Alpes-Côte d'Azur",
    pays_id: 'FR',
    cheflieu_id: '13055'
  },
  '94': {
    id: '94',
    nom: 'Corse',
    pays_id: 'FR',
    cheflieu_id: '2A004'
  }
}
