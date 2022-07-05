import { RegionId } from './region'

export const DEPARTEMENT_IDS = {
  Ain: '01',
  Aisne: '02',
  Allier: '03',
  'Alpes-de-Haute-Provence': '04',
  'Hautes-Alpes': '05',
  'Alpes-Maritimes': '06',
  Ardèche: '07',
  Ardennes: '08',
  Ariège: '09',
  Aube: '10',
  Aude: '11',
  Aveyron: '12',
  'Bouches-du-Rhône': '13',
  Calvados: '14',
  Cantal: '15',
  Charente: '16',
  'Charente-Maritime': '17',
  Cher: '18',
  Corrèze: '19',
  "Côte-d'Or": '21',
  "Côtes-d'Armor": '22',
  Creuse: '23',
  Dordogne: '24',
  Doubs: '25',
  Drôme: '26',
  Eure: '27',
  'Eure-et-Loir': '28',
  Finistère: '29',
  'Corse-du-Sud': '2A',
  'Haute-Corse': '2B',
  Gard: '30',
  'Haute-Garonne': '31',
  Gers: '32',
  Gironde: '33',
  Hérault: '34',
  'Ille-et-Vilaine': '35',
  Indre: '36',
  'Indre-et-Loire': '37',
  Isère: '38',
  Jura: '39',
  Landes: '40',
  'Loir-et-Cher': '41',
  Loire: '42',
  'Haute-Loire': '43',
  'Loire-Atlantique': '44',
  Loiret: '45',
  Lot: '46',
  'Lot-et-Garonne': '47',
  Lozère: '48',
  'Maine-et-Loire': '49',
  Manche: '50',
  Marne: '51',
  'Haute-Marne': '52',
  Mayenne: '53',
  'Meurthe-et-Moselle': '54',
  Meuse: '55',
  Morbihan: '56',
  Moselle: '57',
  Nièvre: '58',
  Nord: '59',
  Oise: '60',
  Orne: '61',
  'Pas-de-Calais': '62',
  'Puy-de-Dôme': '63',
  'Pyrénées-Atlantiques': '64',
  'Hautes-Pyrénées': '65',
  'Pyrénées-Orientales': '66',
  'Bas-Rhin': '67',
  'Haut-Rhin': '68',
  Rhône: '69',
  'Haute-Saône': '70',
  'Saône-et-Loire': '71',
  Sarthe: '72',
  Savoie: '73',
  'Haute-Savoie': '74',
  Paris: '75',
  'Seine-Maritime': '76',
  'Seine-et-Marne': '77',
  Yvelines: '78',
  'Deux-Sèvres': '79',
  Somme: '80',
  Tarn: '81',
  'Tarn-et-Garonne': '82',
  Var: '83',
  Vaucluse: '84',
  Vendée: '85',
  Vienne: '86',
  'Haute-Vienne': '87',
  Vosges: '88',
  Yonne: '89',
  'Territoire de Belfort': '90',
  Essonne: '91',
  'Hauts-de-Seine': '92',
  'Seine-Saint-Denis': '93',
  'Val-de-Marne': '94',
  "Val-d'Oise": '95',
  Guadeloupe: '971',
  Martinique: '972',
  Guyane: '973',
  'La Réunion': '974',
  Mayotte: '976'
} as const

export interface Departement<T = DepartementId> {
  id: T
  nom: string
  regionId: RegionId
}

export type DepartementId = typeof DEPARTEMENT_IDS[keyof typeof DEPARTEMENT_IDS]

export const Departements: { [key in DepartementId]: Departement<key> } = {
  '01': {
    id: '01',
    nom: 'Ain',
    regionId: '84'
  },
  '02': {
    id: '02',
    nom: 'Aisne',
    regionId: '32'
  },
  '03': {
    id: '03',
    nom: 'Allier',
    regionId: '84'
  },
  '04': {
    id: '04',
    nom: 'Alpes-de-Haute-Provence',
    regionId: '93'
  },
  '05': {
    id: '05',
    nom: 'Hautes-Alpes',
    regionId: '93'
  },
  '06': {
    id: '06',
    nom: 'Alpes-Maritimes',
    regionId: '93'
  },
  '07': {
    id: '07',
    nom: 'Ardèche',
    regionId: '84'
  },
  '08': {
    id: '08',
    nom: 'Ardennes',
    regionId: '44'
  },
  '09': {
    id: '09',
    nom: 'Ariège',
    regionId: '76'
  },
  '10': {
    id: '10',
    nom: 'Aube',
    regionId: '44'
  },
  '11': {
    id: '11',
    nom: 'Aude',
    regionId: '76'
  },
  '12': {
    id: '12',
    nom: 'Aveyron',
    regionId: '76'
  },
  '13': {
    id: '13',
    nom: 'Bouches-du-Rhône',
    regionId: '93'
  },
  '14': {
    id: '14',
    nom: 'Calvados',
    regionId: '28'
  },
  '15': {
    id: '15',
    nom: 'Cantal',
    regionId: '84'
  },
  '16': {
    id: '16',
    nom: 'Charente',
    regionId: '75'
  },
  '17': {
    id: '17',
    nom: 'Charente-Maritime',
    regionId: '75'
  },
  '18': {
    id: '18',
    nom: 'Cher',
    regionId: '24'
  },
  '19': {
    id: '19',
    nom: 'Corrèze',
    regionId: '75'
  },
  '21': {
    id: '21',
    nom: "Côte-d'Or",
    regionId: '27'
  },
  '22': {
    id: '22',
    nom: "Côtes-d'Armor",
    regionId: '53'
  },
  '23': {
    id: '23',
    nom: 'Creuse',
    regionId: '75'
  },
  '24': {
    id: '24',
    nom: 'Dordogne',
    regionId: '75'
  },
  '25': {
    id: '25',
    nom: 'Doubs',
    regionId: '27'
  },
  '26': {
    id: '26',
    nom: 'Drôme',
    regionId: '84'
  },
  '27': {
    id: '27',
    nom: 'Eure',
    regionId: '28'
  },
  '28': {
    id: '28',
    nom: 'Eure-et-Loir',
    regionId: '24'
  },
  '29': {
    id: '29',
    nom: 'Finistère',
    regionId: '53'
  },
  '2A': {
    id: '2A',
    nom: 'Corse-du-Sud',
    regionId: '94'
  },
  '2B': {
    id: '2B',
    nom: 'Haute-Corse',
    regionId: '94'
  },
  '30': {
    id: '30',
    nom: 'Gard',
    regionId: '76'
  },
  '31': {
    id: '31',
    nom: 'Haute-Garonne',
    regionId: '76'
  },
  '32': {
    id: '32',
    nom: 'Gers',
    regionId: '76'
  },
  '33': {
    id: '33',
    nom: 'Gironde',
    regionId: '75'
  },
  '34': {
    id: '34',
    nom: 'Hérault',
    regionId: '76'
  },
  '35': {
    id: '35',
    nom: 'Ille-et-Vilaine',
    regionId: '53'
  },
  '36': {
    id: '36',
    nom: 'Indre',
    regionId: '24'
  },
  '37': {
    id: '37',
    nom: 'Indre-et-Loire',
    regionId: '24'
  },
  '38': {
    id: '38',
    nom: 'Isère',
    regionId: '84'
  },
  '39': {
    id: '39',
    nom: 'Jura',
    regionId: '27'
  },
  '40': {
    id: '40',
    nom: 'Landes',
    regionId: '75'
  },
  '41': {
    id: '41',
    nom: 'Loir-et-Cher',
    regionId: '24'
  },
  '42': {
    id: '42',
    nom: 'Loire',
    regionId: '84'
  },
  '43': {
    id: '43',
    nom: 'Haute-Loire',
    regionId: '84'
  },
  '44': {
    id: '44',
    nom: 'Loire-Atlantique',
    regionId: '52'
  },
  '45': {
    id: '45',
    nom: 'Loiret',
    regionId: '24'
  },
  '46': {
    id: '46',
    nom: 'Lot',
    regionId: '76'
  },
  '47': {
    id: '47',
    nom: 'Lot-et-Garonne',
    regionId: '75'
  },
  '48': {
    id: '48',
    nom: 'Lozère',
    regionId: '76'
  },
  '49': {
    id: '49',
    nom: 'Maine-et-Loire',
    regionId: '52'
  },
  '50': {
    id: '50',
    nom: 'Manche',
    regionId: '28'
  },
  '51': {
    id: '51',
    nom: 'Marne',
    regionId: '44'
  },
  '52': {
    id: '52',
    nom: 'Haute-Marne',
    regionId: '44'
  },
  '53': {
    id: '53',
    nom: 'Mayenne',
    regionId: '52'
  },
  '54': {
    id: '54',
    nom: 'Meurthe-et-Moselle',
    regionId: '44'
  },
  '55': {
    id: '55',
    nom: 'Meuse',
    regionId: '44'
  },
  '56': {
    id: '56',
    nom: 'Morbihan',
    regionId: '53'
  },
  '57': {
    id: '57',
    nom: 'Moselle',
    regionId: '44'
  },
  '58': {
    id: '58',
    nom: 'Nièvre',
    regionId: '27'
  },
  '59': {
    id: '59',
    nom: 'Nord',
    regionId: '32'
  },
  '60': {
    id: '60',
    nom: 'Oise',
    regionId: '32'
  },
  '61': {
    id: '61',
    nom: 'Orne',
    regionId: '28'
  },
  '62': {
    id: '62',
    nom: 'Pas-de-Calais',
    regionId: '32'
  },
  '63': {
    id: '63',
    nom: 'Puy-de-Dôme',
    regionId: '84'
  },
  '64': {
    id: '64',
    nom: 'Pyrénées-Atlantiques',
    regionId: '75'
  },
  '65': {
    id: '65',
    nom: 'Hautes-Pyrénées',
    regionId: '76'
  },
  '66': {
    id: '66',
    nom: 'Pyrénées-Orientales',
    regionId: '76'
  },
  '67': {
    id: '67',
    nom: 'Bas-Rhin',
    regionId: '44'
  },
  '68': {
    id: '68',
    nom: 'Haut-Rhin',
    regionId: '44'
  },
  '69': {
    id: '69',
    nom: 'Rhône',
    regionId: '84'
  },
  '70': {
    id: '70',
    nom: 'Haute-Saône',
    regionId: '27'
  },
  '71': {
    id: '71',
    nom: 'Saône-et-Loire',
    regionId: '27'
  },
  '72': {
    id: '72',
    nom: 'Sarthe',
    regionId: '52'
  },
  '73': {
    id: '73',
    nom: 'Savoie',
    regionId: '84'
  },
  '74': {
    id: '74',
    nom: 'Haute-Savoie',
    regionId: '84'
  },
  '75': {
    id: '75',
    nom: 'Paris',
    regionId: '11'
  },
  '76': {
    id: '76',
    nom: 'Seine-Maritime',
    regionId: '28'
  },
  '77': {
    id: '77',
    nom: 'Seine-et-Marne',
    regionId: '11'
  },
  '78': {
    id: '78',
    nom: 'Yvelines',
    regionId: '11'
  },
  '79': {
    id: '79',
    nom: 'Deux-Sèvres',
    regionId: '75'
  },
  '80': {
    id: '80',
    nom: 'Somme',
    regionId: '32'
  },
  '81': {
    id: '81',
    nom: 'Tarn',
    regionId: '76'
  },
  '82': {
    id: '82',
    nom: 'Tarn-et-Garonne',
    regionId: '76'
  },
  '83': {
    id: '83',
    nom: 'Var',
    regionId: '93'
  },
  '84': {
    id: '84',
    nom: 'Vaucluse',
    regionId: '93'
  },
  '85': {
    id: '85',
    nom: 'Vendée',
    regionId: '52'
  },
  '86': {
    id: '86',
    nom: 'Vienne',
    regionId: '75'
  },
  '87': {
    id: '87',
    nom: 'Haute-Vienne',
    regionId: '75'
  },
  '88': {
    id: '88',
    nom: 'Vosges',
    regionId: '44'
  },
  '89': {
    id: '89',
    nom: 'Yonne',
    regionId: '27'
  },
  '90': {
    id: '90',
    nom: 'Territoire de Belfort',
    regionId: '27'
  },
  '91': {
    id: '91',
    nom: 'Essonne',
    regionId: '11'
  },
  '92': {
    id: '92',
    nom: 'Hauts-de-Seine',
    regionId: '11'
  },
  '93': {
    id: '93',
    nom: 'Seine-Saint-Denis',
    regionId: '11'
  },
  '94': {
    id: '94',
    nom: 'Val-de-Marne',
    regionId: '11'
  },
  '95': {
    id: '95',
    nom: "Val-d'Oise",
    regionId: '11'
  },
  '971': {
    id: '971',
    nom: 'Guadeloupe',
    regionId: '01'
  },
  '972': {
    id: '972',
    nom: 'Martinique',
    regionId: '02'
  },
  '973': {
    id: '973',
    nom: 'Guyane',
    regionId: '03'
  },
  '974': {
    id: '974',
    nom: 'La Réunion',
    regionId: '04'
  },
  '976': {
    id: '976',
    nom: 'Mayotte',
    regionId: '06'
  }
}

const departementIds = Object.values(DEPARTEMENT_IDS)
export const isDepartementId = (
  departementId: string | null | undefined
): departementId is DepartementId => departementIds.includes(departementId)

export const departements = Object.values(Departements)
