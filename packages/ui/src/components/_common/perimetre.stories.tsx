import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue3'
import { MapPattern } from '../_map/pattern'
import { Perimetre } from './perimetre'
import { MultiPolygon, Feature } from 'geojson'

const meta: Meta = {
  title: 'Components/common/Perimetre',
  component: Perimetre
}
export default meta

const points = [
  {
    id: '25DvyBbQb36lhOMLfnHNQdUS',
    coordonnees: { x: -52.5660583466962, y: 4.23944263425535 },
    groupe: 1,
    contour: 1,
    point: 1,
    nom: '1',
    description: null,
    securite: null,
    subsidiaire: null,
    lot: null,
    references: [
      {
        id: 'LuCo981JNl3qxDPqbYrxrdsv',
        geoSystemeId: '2972',
        coordonnees: { x: 326189, y: 468770 },
        opposable: true
      }
    ]
  },
  {
    id: 'kMuGGS0LvNBOzZQWtsEtwiiu',
    coordonnees: { x: -52.5619271168799, y: 4.24113309117193 },
    groupe: 1,
    contour: 1,
    point: 2,
    nom: '2',
    description: null,
    securite: null,
    subsidiaire: null,
    lot: null,
    references: [
      {
        id: '0sZpojhYRJj1vM1d8e5r3o6U',
        geoSystemeId: '2972',
        coordonnees: { x: 326648, y: 468956 },
        opposable: true
      }
    ]
  },
  {
    id: 'LkkqNpE0NzNn7CtcMF3n0uPn',
    coordonnees: { x: -52.5550566725882, y: 4.22438936251509 },
    groupe: 1,
    contour: 1,
    point: 3,
    nom: '3',
    description: null,
    securite: null,
    subsidiaire: null,
    lot: null,
    references: [
      {
        id: 'jB79NK3nQxTH9cmU5TREvnzP',
        geoSystemeId: '2972',
        coordonnees: { x: 327407, y: 467103 },
        opposable: true
      }
    ]
  },
  {
    id: 'xmoDhZYRLIR4jOcSl4Aidfeb',
    coordonnees: { x: -52.5591878553913, y: 4.22269896902571 },
    groupe: 1,
    contour: 1,
    point: 4,
    nom: '4',
    description: null,
    securite: null,
    subsidiaire: null,
    lot: null,
    references: [
      {
        id: 'kvBT0NDUT78EwrtRgWyCGvmx',
        geoSystemeId: '2972',
        coordonnees: { x: 326948, y: 466917 },
        opposable: true
      }
    ]
  }
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
          [-52.5660583466962, 4.23944263425535]
        ]
      ]
    ]
  }
}

const tabUpdate = action('tabUpdate')
export const DefaultNoSnapshot: Story = () => (
  <>
    <MapPattern />
    <Perimetre
      titreTypeId="axm"
      points={points}
      geojsonMultiPolygon={geojsonMultiPolygon}
      titreId="id"
      tabUpdate={tabUpdate}
    />
  </>
)

export const NoMap: Story = () => (
  <>
    <MapPattern />
    <Perimetre
      titreTypeId="axm"
      geojsonMultiPolygon={geojsonMultiPolygon}
      titreId="id"
      tabUpdate={tabUpdate}
    />
  </>
)
