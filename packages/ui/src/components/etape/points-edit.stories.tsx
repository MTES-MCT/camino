import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { ApiClient } from '@/api/api-client'
import { FeatureMultiPolygon, GeojsonInformations } from 'camino-common/src/perimetre'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { PointsEdit, Props } from './points-edit'
import { toCaminoDate } from 'camino-common/src/date'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { km2Validator } from 'camino-common/src/number'

const meta: Meta = {
  title: 'Components/Etape/PointEdit',
  component: PointsEdit,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const geojsonImportAction = action('geojsonImport')
const uploadTempDocumentAction = action('uploadTempDocumentAction')
const getGeojsonByGeoSystemeIdAction = action('getGeojsonByGeoSystemeId')
const completeUpdateAction = action('completeUpdate')
const onEtapeChangeAction = action('onEtapeChange')

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

const apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport' | 'getGeojsonByGeoSystemeId'> = {
  geojsonImport(body, geoSystemeId) {
    geojsonImportAction(body, geoSystemeId)
    const result: GeojsonInformations = {
      superposition_alertes: [],
      communes: [],
      foretIds: [],
      geojson4326_perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[12, 12]]]] } },
      surface: km2Validator.parse(9),
      geojson4326_points: null,
      sdomZoneIds: [],
      secteurMaritimeIds: [],
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

const completeUpdate = (value: boolean) => {
  completeUpdateAction(value)
}

const onEtapeChange = (geojsonInformations: GeojsonInformations) => {
  onEtapeChangeAction(geojsonInformations)
}
const etapeNoHeritage: Props['etape'] = {
  typeId: 'mfr',
  heritageProps: { perimetre: { actif: false } },
  geojson4326Perimetre: null,
  geojson4326Points: null,
  surface: null,
}

const titreSlug = titreSlugValidator.parse('titre-slug')
export const EmptyNoHeritage: StoryFn = () => (
  <PointsEdit initTab="points" apiClient={apiClient} etape={etapeNoHeritage} titreTypeId="arm" titreSlug={titreSlug} completeUpdate={completeUpdate} onEtapeChange={onEtapeChange} />
)
const etapeEmptyHeritage: Props['etape'] = {
  ...etapeNoHeritage,
  typeId: 'dpu',
  heritageProps: { perimetre: { actif: true, etape: { date: toCaminoDate('2023-01-01'), type: EtapesTypes.mfr,   geojson4326Perimetre: null,
  geojson4326Points: null,
  surface: null, } } },
}
export const EmptyHeritage: StoryFn = () => (
  <PointsEdit initTab="points" completeUpdate={completeUpdate} onEtapeChange={onEtapeChange} apiClient={apiClient} etape={etapeEmptyHeritage} titreTypeId="arm" titreSlug={titreSlug} />
)

const etapeHeritage: Props['etape'] = {
  ...etapeEmptyHeritage,
  heritageProps: {
    perimetre: {
      actif: true,
      etape: {
        date: toCaminoDate('2023-01-01'),
        type: EtapesTypes.mfr,
        surface: km2Validator.parse(2),
        geojson4326Perimetre: perimetre,
        geojson4326Points: null,
      },
    },
  },
}
export const Heritage: StoryFn = () => (
  <PointsEdit initTab="points" completeUpdate={completeUpdate} onEtapeChange={onEtapeChange} apiClient={apiClient} etape={etapeHeritage} titreTypeId="arm" titreSlug={titreSlug} />
)

const etape: Props['etape'] = {
  ...etapeEmptyHeritage,
  geojson4326Perimetre: perimetre,
  heritageProps: { perimetre: { actif: false } },
}
export const FilledNoHeritage: StoryFn = () => (
  <PointsEdit initTab="points" completeUpdate={completeUpdate} onEtapeChange={onEtapeChange} apiClient={apiClient} etape={etape} titreTypeId="arm" titreSlug={titreSlug} />
)
