export const PAYS_IDS = {
  "Collectivité d'outre-mer de Saint-Barthélemy": 'BL',
  'République Française': 'FR',
  'Département de la Guyane': 'GF',
  'Département de la Guadeloupe': 'GP',
  "Collectivité d'outre-mer de Saint-Martin": 'MF',
  'Département de la Martinique': 'MQ',
  'Nouvelle-Calédonie': 'NC',
  'Polynésie Française': 'PF',
  'Collectivité Territoriale de Saint-Pierre-et-Miquelon': 'PM',
  'Département de La Réunion': 'RE',
  'Terres Australes Françaises': 'TF',
  'Wallis-et-Futuna': 'WF',
  'Clipperton (Île)': 'XX',
  'Département de Mayotte': 'YT'
} as const

export interface Pays<T = PaysId> {
  id: T
  nom: string
}

export type PaysId = typeof PAYS_IDS[keyof typeof PAYS_IDS]

export const PaysList: { [key in PaysId]: Pays<key> } = {
  BL: { id: 'BL', nom: "Collectivité d'outre-mer de Saint-Barthélemy" },
  FR: { id: 'FR', nom: 'République Française' },
  GF: { id: 'GF', nom: 'Département de la Guyane' },
  GP: { id: 'GP', nom: 'Département de la Guadeloupe' },
  MF: { id: 'MF', nom: "Collectivité d'outre-mer de Saint-Martin" },
  MQ: { id: 'MQ', nom: 'Département de la Martinique' },
  NC: { id: 'NC', nom: 'Nouvelle-Calédonie' },
  PF: { id: 'PF', nom: 'Polynésie Française' },
  PM: { id: 'PM', nom: 'Collectivité Territoriale de Saint-Pierre-et-Miquelon' },
  RE: { id: 'RE', nom: 'Département de La Réunion' },
  TF: { id: 'TF', nom: 'Terres Australes Françaises' },
  WF: { id: 'WF', nom: 'Wallis-et-Futuna' },
  XX: { id: 'XX', nom: 'Clipperton (Île)' },
  YT: { id: 'YT', nom: 'Département de Mayotte' }
}

const PAYS_IDS_LIST = Object.values(PAYS_IDS)

export const isPaysId = (value: string): value is PaysId => PAYS_IDS_LIST.includes(value)
