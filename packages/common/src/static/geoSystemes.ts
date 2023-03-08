export const GEO_SYSTEME_IDS = {
  'RGF93 / Lambert-93': '2154',
  'NTF (Paris) / Lambert Nord France': '27561',
  'NTF (Paris) / Lambert Sud france': '27563',
  'NTF (Paris) / Lambert zone I': '27571',
  'NTF (Paris) / Lambert zone II': '27572',
  'NTF (Paris) / Lambert zone III': '27573',
  'Guadeloupe 1948 / UTM zone 20N': '2970',
  'RGFG95 / UTM zone 22N': '2972',
  'WGS84 / UTM zone 20N': '32620',
  'WGS84 / UTM zone 21N': '32621',
  'WGS84 / UTM zone 22N': '32622',
  'WGS84 / UTM zone 30N': '32630',
  'RGFG95 / UTM zone 21N': '3313',
  'RGF93 / CC49': '3949',
  RGF93: '4171',
  ED50: '4230',
  'NTF (Greenwich)': '4275',
  WGS84: '4326',
  RGFG95: '4624',
  'NTF (Paris)': '4807',
  'RGAF09 / UTM zone 20N': '5490',
  'Mayotte 2004 / UTM zone 38S': '4471',
  'Réunion ': '2975',
} as const

export interface GeoSysteme<T = GeoSystemeId> {
  id: T
  nom: string
  ordre: number
  uniteId: 'met' | 'deg' | 'gon'
  zone: string
  definitionProj4: string // https://github.com/josueggh/proj4-list/blob/master/list.js
}

export type GeoSystemeId = (typeof GEO_SYSTEME_IDS)[keyof typeof GEO_SYSTEME_IDS]

export const GeoSystemes: { [key in GeoSystemeId]: GeoSysteme<key> } = {
  '2154': {
    id: '2154',
    nom: 'RGF93 / Lambert-93',
    ordre: 1,
    uniteId: 'met',
    zone: 'France - onshore et offshore - continentale et Corse.',
    definitionProj4: '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  },
  '27561': {
    id: '27561',
    nom: 'NTF (Paris) / Lambert Nord France',
    ordre: 10,
    uniteId: 'met',
    zone: "France - continentale au nord de  53,5 grades North (48°09'N).",
    definitionProj4:
      '+proj=lcc +lat_1=49.50000000000001 +lat_0=49.50000000000001 +lon_0=0 +k_0=0.999877341 +x_0=600000 +y_0=200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs',
  },
  '27563': {
    id: '27563',
    nom: 'NTF (Paris) / Lambert Sud france',
    ordre: 11,
    uniteId: 'met',
    zone: "France - continentale au sud de 50,5 grades nord (45°27'N).",
    definitionProj4:
      '+proj=lcc +lat_1=44.10000000000001 +lat_0=44.10000000000001 +lon_0=0 +k_0=0.999877499 +x_0=600000 +y_0=200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs',
  },
  '27571': {
    id: '27571',
    nom: 'NTF (Paris) / Lambert zone I',
    ordre: 12,
    uniteId: 'met',
    zone: "France - continentale au nord de 53,5 grades nord (48°09'N).",
    definitionProj4:
      '+proj=lcc +lat_1=49.50000000000001 +lat_0=49.50000000000001 +lon_0=0 +k_0=0.999877341 +x_0=600000 +y_0=1200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs',
  },
  '27572': {
    id: '27572',
    nom: 'NTF (Paris) / Lambert zone II',
    ordre: 13,
    uniteId: 'met',
    zone: "France - continentale entre 45°27'N et 48°09'N.",
    definitionProj4: '+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs',
  },
  '27573': {
    id: '27573',
    nom: 'NTF (Paris) / Lambert zone III',
    ordre: 14,
    uniteId: 'met',
    zone: "France - continentale au sud de 50,5 grades nord (45°27'N).",
    definitionProj4:
      '+proj=lcc +lat_1=44.10000000000001 +lat_0=44.10000000000001 +lon_0=0 +k_0=0.999877499 +x_0=600000 +y_0=3200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs',
  },
  '2970': {
    id: '2970',
    nom: 'Guadeloupe 1948 / UTM zone 20N',
    ordre: 20,
    uniteId: 'met',
    zone: 'Guadeloupe - onshore - Basse-Terre, Grande-Terre, La Desirade, Marie-Galante, Les Saintes.',
    definitionProj4: '+proj=utm +zone=20 +ellps=intl +towgs84=-467,-16,-300,0,0,0,0 +units=m +no_defs',
  },
  '2972': {
    id: '2972',
    nom: 'RGFG95 / UTM zone 22N',
    ordre: 2,
    uniteId: 'met',
    zone: 'Guyane française - onshore et offshore.',
    definitionProj4: '+proj=utm +zone=22 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  },
  '32620': {
    id: '32620',
    nom: 'WGS84 / UTM zone 20N',
    ordre: 16,
    uniteId: 'met',
    zone: 'Hémisphère Nord - entre 66°W et 60°W',
    definitionProj4: '+proj=utm +zone=20 +datum=WGS84 +units=m +no_defs',
  },
  '32621': {
    id: '32621',
    nom: 'WGS84 / UTM zone 21N',
    ordre: 17,
    uniteId: 'met',
    zone: 'Hémisphère Nord - entre 60°W et 54°W',
    definitionProj4: '+proj=utm +zone=21 +datum=WGS84 +units=m +no_defs',
  },
  '32622': {
    id: '32622',
    nom: 'WGS84 / UTM zone 22N',
    ordre: 18,
    uniteId: 'met',
    zone: 'Hémisphère Nord - entre 54°W et 48°W',
    definitionProj4: '+proj=utm +zone=22 +datum=WGS84 +units=m +no_defs',
  },
  '32630': {
    id: '32630',
    nom: 'WGS84 / UTM zone 30N',
    ordre: 19,
    uniteId: 'met',
    zone: 'Hémisphère Nord - entre 6°W et 0°W',
    definitionProj4: '+proj=utm +zone=30 +datum=WGS84 +units=m +no_defs',
  },
  '3313': {
    id: '3313',
    nom: 'RGFG95 / UTM zone 21N',
    ordre: 21,
    uniteId: 'met',
    zone: 'Guyane française - onshore et offshore.',
    definitionProj4: '+proj=utm +zone=21 +ellps=GRS80 +towgs84=2,2,-2,0,0,0,0 +units=m +no_defs',
  },
  '3949': {
    id: '3949',
    nom: 'RGF93 / CC49',
    ordre: 15,
    uniteId: 'met',
    zone: 'France - continentale entre 48°N et 50°N.',
    definitionProj4: '+proj=lcc +lat_1=48.25 +lat_2=49.75 +lat_0=49 +lon_0=3 +x_0=1700000 +y_0=8200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  },
  '4171': {
    id: '4171',
    nom: 'RGF93',
    ordre: 4,
    uniteId: 'deg',
    zone: 'France - onshore et offshore - continentale et Corse.',
    definitionProj4: '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs',
  },
  '4230': {
    id: '4230',
    nom: 'ED50',
    ordre: 7,
    uniteId: 'deg',
    zone: 'Europe',
    definitionProj4: '+proj=longlat +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +no_defs',
  },
  '4275': {
    id: '4275',
    nom: 'NTF (Greenwich)',
    ordre: 8,
    uniteId: 'deg',
    zone: 'France - onshore - continentale et Corse.',
    definitionProj4: '+proj=longlat +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +no_defs',
  },
  '4326': {
    id: '4326',
    nom: 'WGS84',
    ordre: 6,
    uniteId: 'deg',
    zone: 'Monde',
    definitionProj4: '+proj=longlat +datum=WGS84 +no_defs',
  },
  '4624': {
    id: '4624',
    nom: 'RGFG95',
    ordre: 5,
    uniteId: 'deg',
    zone: 'French Guiana - onshore and offshore.',
    definitionProj4: '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs ',
  },
  '4807': {
    id: '4807',
    nom: 'NTF (Paris)',
    ordre: 9,
    uniteId: 'gon',
    zone: 'France - onshore - continentale et Corse.',
    definitionProj4: '+proj=longlat +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +no_defs',
  },
  '5490': {
    id: '5490',
    nom: 'RGAF09 / UTM zone 20N',
    ordre: 3,
    uniteId: 'met',
    zone: "Antilles françaises onshore et offshore à l'ouest du méridien 60° Ouest - Guadeloupe (incluant Grande Terre, Basse Terre, Marie Galante, Les Saintes, Iles de la Petite Terre, La Desirade, St Barthélemy, partie nord de St Martin) et Martinique.",
    definitionProj4: '+proj=utm +zone=20 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ',
  },
  '4471': {
    id: '4471',
    nom: 'Mayotte 2004 / UTM zone 38S',
    ordre: 22,
    uniteId: 'met',
    zone: 'Mayotte - onshore et offshore',
    definitionProj4: '+proj=utm +zone=38 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ',
  },
  '2975': {
    id: '2975',
    nom: 'Réunion / UTM zone 40S',
    ordre: 23,
    uniteId: 'met',
    zone: 'Réuinon',
    definitionProj4: '+proj=utm +zone=40 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ',
  },
}

export const sortedGeoSystemes = Object.values(GeoSystemes).sort((a, b) => a.ordre - b.ordre)

export function assertGeoSystemeId(geoSystemeId: string): asserts geoSystemeId is GeoSystemeId {
  if (!Object.values(GEO_SYSTEME_IDS).includes(geoSystemeId)) {
    throw new Error(`système géographique inconnu : EPSG:${geoSystemeId}`)
  }
}
