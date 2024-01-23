import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { ApiClient } from '@/api/api-client'
import { FeatureMultiPolygon, GeojsonInformations } from 'camino-common/src/perimetre'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { PointsEdit, Props } from './points-edit'
import { toCaminoAnnee, toCaminoDate } from 'camino-common/src/date'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { titreSlugValidator } from 'camino-common/src/validators/titres'

const meta: Meta = {
  title: 'Components/Etape/PointEdit',
  component: PointsEdit,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],

}
export default meta

const geojsonImportAction = action('geojsonImport')
const uploadTempDocumentAction = action('uploadTempDocumentAction')
const getGeojsonByGeoSystemeIdAction = action('getGeojsonByGeoSystemeId')

const perimetre: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},

  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-52.54, 4.22269896902571],
          [-52.55, 4.22438936251509],
          [-52.55, 4.24113309117193],
          [-52.54, 4.22269896902571],
        ],
      ],
    ],
  },
}

const apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport' | 'getGeojsonByGeoSystemeId' > = {
geojsonImport(body, geoSystemeId) {
  geojsonImportAction(body, geoSystemeId)
  const result: GeojsonInformations = {
    alertes: [],
    communes: [],
    foretIds: [], 
    geojson4326_perimetre: {type: 'Feature', properties: {}, geometry: {type: 'MultiPolygon', coordinates: [[[[12, 12]]]]}},
    surface: 9,
    geojson4326_points: null,
    sdomZoneIds: [],
    secteurMaritimeIds: []
  }
  return Promise.resolve(result)
},
uploadTempDocument(document) {
  uploadTempDocumentAction(document)
  return Promise.resolve(tempDocumentNameValidator.parse('name'))
},
getGeojsonByGeoSystemeId(geojson, geoSystemeId) {
  getGeojsonByGeoSystemeIdAction(geojson, geoSystemeId)
  return Promise.resolve(geojson)
},
}

const etapeNoHeritage: Props['etape'] = {
  typeId: 'mfr', 
  heritageProps: {perimetre: {actif: false}},
  geojson4326_perimetre: null,
  geojson4326_points: null,
  surface: 0,
}

const titreSlug = titreSlugValidator.parse('titre-slug')
export const EmptyNoHeritage: StoryFn = () => <PointsEdit apiClient={apiClient} etape={etapeNoHeritage} titreTypeId='arm' titreSlug={titreSlug}  />
const etapeEmptyHeritage: Props['etape'] = {
  ...etapeNoHeritage,
  typeId: 'dpu',
  heritageProps: {perimetre: {actif: true, etape: {date: toCaminoDate('2023-01-01'), type: EtapesTypes['mfr'], perimetre: {
  communes: [],
  forets: [],
  sdom_zones: [],
  secteurs_maritimes: [],
  surface: 2,
  geojson4326_perimetre: null
  } }}},
}
export const EmptyHeritage: StoryFn = () => <PointsEdit apiClient={apiClient} etape={etapeEmptyHeritage} titreTypeId='arm' titreSlug={titreSlug} />


const etapeHeritage: Props['etape'] = {
  ...etapeEmptyHeritage,
  heritageProps: {perimetre: {actif: true, etape: {date: toCaminoDate('2023-01-01'), type: EtapesTypes['mfr'], perimetre: {
    communes: [],
    forets: [],
    sdom_zones: [],
    secteurs_maritimes: [],
    surface: 2,
    geojson4326_perimetre: perimetre
    } }}},
}
export const Heritage: StoryFn = () => <PointsEdit apiClient={apiClient} etape={etapeHeritage} titreTypeId='arm' titreSlug={titreSlug}  />


const etape: Props['etape'] = {
  ...etapeEmptyHeritage,
  geojson4326_perimetre: perimetre,
  heritageProps: {perimetre: {actif: false}},
}
export const FilledNoHeritage: StoryFn = () => <PointsEdit apiClient={apiClient} etape={etape} titreTypeId='arm' titreSlug={titreSlug} />
