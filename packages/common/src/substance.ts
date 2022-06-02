import { UniteId } from './unites'

export const SUBSTANCES_FISCALES_IDS = {
  bauxite: 'aloh',
  antimoine: 'anti',
  argent: 'arge',
  arsenic: 'arse',
  or: 'auru',
  bismuth: 'bism',
  charbon: 'cfxa',
  'lignites pouvoir calorifique égal ou supérieur à 13 MJ/kg': 'cfxb',
  'lignites pouvoir calorifique inférieur à 13 MJ/kg': 'cfxc',
  'gaz carbonique': 'coox',
  cuivre: 'cuiv',
  étain: 'etai',
  'pyrite de fer': 'fera',
  'minerais de fer': 'ferb',
  fluorine: 'fluo',
  'calcaires et grès bitumineux ou asphaltiques': 'hyda',
  'schistes carbobitumineux et schistes bitumineux': 'hydb',
  'pétrole brut': 'hydc',
  'propane et le butane': 'hydd',
  'essence de dégazolinage': 'hyde',
  'gaz naturel': 'hydf',
  'oxyde de potassium': 'kclx',
  'oxyde de lithium': 'lith',
  manganèse: 'mang',
  molybdène: 'moly',
  'sel (chlorure de sodium) extrait par abattage': 'naca',
  'sel (chlorure de sodium) extrait en dissolution par sondage': 'nacb',
  'sel (chlorure de sodium contenu)': 'nacc',
  plomb: 'plom',
  soufre: 'souf',
  uranium: 'uran',
  'oxyde de tungstène (WO3)': 'wolf',
  zinc: 'zinc'
} as const

export type SubstanceFiscaleId =
  typeof SUBSTANCES_FISCALES_IDS[keyof typeof SUBSTANCES_FISCALES_IDS]

export interface SubstanceFiscale<T = SubstanceFiscaleId> {
  id: T
  nom: string
  // TODO 2022-05-31: extract this from DB
  substanceLegaleId: string
  uniteId: UniteId
  description: string
}

export const SubstancesFiscale: {
  [key in SubstanceFiscaleId]: SubstanceFiscale<key>
} = {
  aloh: {
    id: 'aloh',
    substanceLegaleId: 'aloh',
    uniteId: 'mtk',
    nom: 'bauxite',
    description: 'bauxite nettes livrées'
  },
  anti: {
    id: 'anti',
    substanceLegaleId: 'anti',
    uniteId: 'mtt',
    nom: 'antimoine',
    description: 'contenu dans les minerais'
  },
  arge: {
    id: 'arge',
    substanceLegaleId: 'arge',
    uniteId: 'mkc',
    nom: 'argent',
    description: 'contenu dans les minerais'
  },
  arse: {
    id: 'arse',
    substanceLegaleId: 'arse',
    uniteId: 'mtk',
    nom: 'arsenic',
    description: 'contenu dans les minerais'
  },
  auru: {
    id: 'auru',
    substanceLegaleId: 'auru',
    uniteId: 'mgr',
    nom: 'or',
    description: 'contenu dans les minerais'
  },
  bism: {
    id: 'bism',
    substanceLegaleId: 'bism',
    uniteId: 'mtt',
    nom: 'bismuth',
    description: 'contenu dans les minerais'
  },
  cfxa: {
    id: 'cfxa',
    substanceLegaleId: 'cfxx',
    uniteId: 'mtc',
    nom: 'charbon',
    description: 'net extrait'
  },
  cfxb: {
    id: 'cfxb',
    substanceLegaleId: 'cfxx',
    uniteId: 'mtk',
    nom: 'lignites',
    description:
      "net livré pour les lignites d'un pouvoir calorifique égal ou supérieur à 13 MJ/kg"
  },
  cfxc: {
    id: 'cfxc',
    substanceLegaleId: 'cfxx',
    uniteId: 'mtk',
    nom: 'lignites',
    description:
      "net livré pour les lignites d'un pouvoir calorifique inférieur à 13 MJ/kg"
  },
  coox: {
    id: 'coox',
    substanceLegaleId: 'coox',
    uniteId: 'vmd',
    nom: 'gaz carbonique',
    description: 'extrait à 1 bar et 15 °C'
  },
  cuiv: {
    id: 'cuiv',
    substanceLegaleId: 'cuiv',
    uniteId: 'mtt',
    nom: 'cuivre',
    description: 'contenu dans les minerais'
  },
  etai: {
    id: 'etai',
    substanceLegaleId: 'etai',
    uniteId: 'mtt',
    nom: 'étain',
    description: 'contenu dans les minerais'
  },
  fera: {
    id: 'fera',
    substanceLegaleId: 'ferx',
    uniteId: 'mtt',
    nom: 'pyrite de fer',
    description: 'net livré'
  },
  ferb: {
    id: 'ferb',
    substanceLegaleId: 'ferx',
    uniteId: 'mtt',
    nom: 'minerais de fer',
    description: 'net livré'
  },
  fluo: {
    id: 'fluo',
    substanceLegaleId: 'fluo',
    uniteId: 'mtk',
    nom: 'fluorine',
    description: 'net livré'
  },
  hyda: {
    id: 'hyda',
    substanceLegaleId: 'hydm',
    uniteId: 'mtk',
    nom: 'calcaires et grès bitumineux ou asphaltiques',
    description:
      "net livré (non destinés à la distillation pour production d'huiles ou d'essences)"
  },
  hydb: {
    id: 'hydb',
    substanceLegaleId: 'hydm',
    uniteId: 'mtt',
    nom: 'schistes carbobitumineux et schistes bitumineux',
    description:
      'net livré (à traiter par distillation pour en extraire des huiles et des essences)'
  },
  hydc: {
    id: 'hydc',
    substanceLegaleId: 'hydx',
    uniteId: 'mtc',
    nom: 'pétrole brut',
    description: 'net extrait'
  },
  hydd: {
    id: 'hydd',
    substanceLegaleId: 'hydx',
    uniteId: 'mtt',
    nom: 'propane et le butane',
    description: 'net livré'
  },
  hyde: {
    id: 'hyde',
    substanceLegaleId: 'hydx',
    uniteId: 'mtt',
    nom: 'essence de dégazolinage',
    description: 'net livré'
  },
  hydf: {
    id: 'hydf',
    substanceLegaleId: 'hydx',
    uniteId: 'vmd',
    nom: 'gaz naturel',
    description: 'extrait des gisements'
  },
  kclx: {
    id: 'kclx',
    substanceLegaleId: 'kclx',
    uniteId: 'mtc',
    nom: 'oxyde de potassium',
    description: 'K2O contenu dans les sels de potassium'
  },
  lith: {
    id: 'lith',
    substanceLegaleId: 'lith',
    uniteId: 'mtt',
    nom: 'oxyde de lithium',
    description: 'Li2O contenu dans les minerais de lithium'
  },
  mang: {
    id: 'mang',
    substanceLegaleId: 'mang',
    uniteId: 'mtc',
    nom: 'manganèse',
    description: 'contenu dans les minerais'
  },
  moly: {
    id: 'moly',
    substanceLegaleId: 'moly',
    uniteId: 'mtt',
    nom: 'molybdène',
    description: 'contenu dans les minerais'
  },
  naca: {
    id: 'naca',
    substanceLegaleId: 'nacl',
    uniteId: 'mtk',
    nom: 'sel (chlorure de sodium)',
    description: 'extrait par abattage net livré'
  },
  nacb: {
    id: 'nacb',
    substanceLegaleId: 'nacl',
    uniteId: 'mtk',
    nom: 'sel (chlorure de sodium)',
    description: 'extrait en dissolution par sondage et livré raffiné'
  },
  nacc: {
    id: 'nacc',
    substanceLegaleId: 'nacl',
    uniteId: 'mtk',
    nom: 'sel (chlorure de sodium contenu)',
    description: 'extrait en dissolution par sondage et livré en dissolution'
  },
  plom: {
    id: 'plom',
    substanceLegaleId: 'plom',
    uniteId: 'mtc',
    nom: 'plomb',
    description: 'contenu dans les minerais'
  },
  souf: {
    id: 'souf',
    substanceLegaleId: 'souf',
    uniteId: 'mtt',
    nom: 'soufre',
    description:
      'contenu dans les minerais de soufre autres que les pyrites de fer'
  },
  uran: {
    id: 'uran',
    substanceLegaleId: 'uran',
    uniteId: 'mkc',
    nom: 'uranium',
    description: 'contenu dans les minerais'
  },
  wolf: {
    id: 'wolf',
    substanceLegaleId: 'wolf',
    uniteId: 'mtt',
    nom: 'oxyde de tungstène (WO3)',
    description: 'contenu dans les minerais'
  },
  zinc: {
    id: 'zinc',
    substanceLegaleId: 'zinc',
    uniteId: 'mtc',
    nom: 'zinc',
    description: 'contenu dans les minerais'
  }
}
