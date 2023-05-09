import { Perimetre } from './perimetre'
import { Meta, StoryFn } from '@storybook/vue3'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { toCaminoDate } from 'camino-common/src/date'
import { MultiPolygon, Feature } from 'geojson'

const meta: Meta = {
  title: 'Components/Etape/Perimetre',
  component: Perimetre,
  argTypes: {},
}
export default meta

const points = [
  {
    id: 'idPoint1',
    coordonnees: { x: -52.5660583466962, y: 4.23944263425535 },
    groupe: 1,
    contour: 1,
    point: 1,
    nom: '1',
    description: null,
    subsidiaire: null,
    lot: null,
    references: [
      {
        id: 'idPoint2',
        geoSystemeId: '2972',
        coordonnees: { x: 326189, y: 468770 },
        opposable: true,
      },
    ],
  },
  {
    id: 'idPoint3',
    coordonnees: { x: -52.5619271168799, y: 4.24113309117193 },
    groupe: 1,
    contour: 1,
    point: 2,
    nom: '2',
    description: null,
    subsidiaire: null,
    lot: null,
    references: [
      {
        id: 'referenceIdPoint3',
        geoSystemeId: '2972',
        coordonnees: { x: 326648, y: 468956 },
        opposable: true,
      },
    ],
  },
  {
    id: 'idPoint4',
    coordonnees: { x: -52.5550566725882, y: 4.22438936251509 },
    groupe: 1,
    contour: 1,
    point: 3,
    nom: '3',
    description: null,
    subsidiaire: null,
    lot: null,
    references: [
      {
        id: 'referenceIdPoint4',
        geoSystemeId: '2972',
        coordonnees: { x: 327407, y: 467103 },
        opposable: true,
      },
    ],
  },
  {
    id: 'idPoint5',
    coordonnees: { x: -52.5591878553913, y: 4.22269896902571 },
    groupe: 1,
    contour: 1,
    point: 4,
    nom: '4',
    description: null,
    subsidiaire: null,
    lot: null,
    references: [
      {
        id: 'referenceIdPoint5',
        geoSystemeId: '2972',
        coordonnees: { x: 326948, y: 466917 },
        opposable: true,
      },
    ],
  },
]
const geojsonMultiPolygon: Feature<MultiPolygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-52.5660583466962, 4.23944263425535],
          [-52.5591878553913, 4.22269896902571],
          [-52.5550566725882, 4.22438936251509],
          [-52.5619271168799, 4.24113309117193],
          [-52.5660583466962, 4.23944263425535],
        ],
      ],
    ],
  },
}

export const Default: StoryFn = () => (
  <Perimetre
    etape={{
      points,
      surface: 12,
      incertitudes: {
        points: false,
        surface: false,
        amodiataires: false,
        date: false,
        dateDebut: false,
        dateFin: false,
        duree: false,
        substances: false,
        titulaires: false,
      },
    }}
    titreTypeId={'apc'}
    geojsonMultiPolygon={geojsonMultiPolygon}
  />
)

export const Incertain: StoryFn = () => (
  <Perimetre
    etape={{
      points,
      surface: 12,
      incertitudes: {
        points: true,
        surface: true,
        amodiataires: false,
        date: false,
        dateDebut: false,
        dateFin: false,
        duree: false,
        substances: false,
        titulaires: false,
      },
    }}
    incertitude={true}
    titreTypeId={'apc'}
    geojsonMultiPolygon={geojsonMultiPolygon}
  />
)
