import { PaysId } from './pays'
import { z } from 'zod'
// prettier-ignore
const IDS = ['01','02','03','04','06','11','24','27','28','32','44','52','53','75','76','84','93','94',] as const
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
  Corse: '94',
} as const

export interface Region<T = RegionId> {
  id: T
  nom: string
  paysId: PaysId
}

export const regionIdValidator = z.enum(IDS)
export type RegionId = z.infer<typeof regionIdValidator>

export const isRegionId = (regionId: string): regionId is RegionId => regionIdValidator.safeParse(regionId).success

export const Regions: { [key in RegionId]: Region<key> } = {
  '01': { id: '01', nom: 'Guadeloupe', paysId: 'GP' },
  '02': { id: '02', nom: 'Martinique', paysId: 'MQ' },
  '03': { id: '03', nom: 'Guyane', paysId: 'GF' },
  '04': { id: '04', nom: 'La Réunion', paysId: 'RE' },
  '06': { id: '06', nom: 'Mayotte', paysId: 'YT' },
  '11': { id: '11', nom: 'Île-de-France', paysId: 'FR' },
  '24': { id: '24', nom: 'Centre-Val de Loire', paysId: 'FR' },
  '27': { id: '27', nom: 'Bourgogne-Franche-Comté', paysId: 'FR' },
  '28': { id: '28', nom: 'Normandie', paysId: 'FR' },
  '32': { id: '32', nom: 'Hauts-de-France', paysId: 'FR' },
  '44': { id: '44', nom: 'Grand Est', paysId: 'FR' },
  '52': { id: '52', nom: 'Pays de la Loire', paysId: 'FR' },
  '53': { id: '53', nom: 'Bretagne', paysId: 'FR' },
  '75': { id: '75', nom: 'Nouvelle-Aquitaine', paysId: 'FR' },
  '76': { id: '76', nom: 'Occitanie', paysId: 'FR' },
  '84': { id: '84', nom: 'Auvergne-Rhône-Alpes', paysId: 'FR' },
  '93': { id: '93', nom: "Provence-Alpes-Côte d'Azur", paysId: 'FR' },
  '94': { id: '94', nom: 'Corse', paysId: 'FR' },
}

export type RegionLabel = (typeof Regions)[RegionId]['nom']

export const regions = Object.values(Regions)
