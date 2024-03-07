import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { ApiClient } from '@/api/api-client'
import { FeatureCollectionPoints, FeatureMultiPolygon, GeojsonInformations } from 'camino-common/src/perimetre'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { PerimetreEdit, Props } from './perimetre-edit'
import { toCaminoDate } from 'camino-common/src/date'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { km2Validator } from 'camino-common/src/number'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes'

const meta: Meta = {
  title: 'Components/Etape/PerimetreEdit',
  // @ts-ignore
  component: PerimetreEdit,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const geojsonImportAction = action('geojsonImport')
const uploadTempDocumentAction = action('uploadTempDocumentAction')
const getGeojsonByGeoSystemeIdAction = action('getGeojsonByGeoSystemeId')
const completeUpdateAction = action('completeUpdate')
const onEtapeChangeAction = action('onEtapeChange')
const onPointsChangeAction = action('onPointsChange')

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

const apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport' | 'getGeojsonByGeoSystemeId' | 'geojsonPointsImport'> = {
  geojsonImport(body, geoSystemeId) {
    geojsonImportAction(body, geoSystemeId)

    return Promise.reject(new Error('plop'))
  },
  geojsonPointsImport(body, geoSystemeId) {
    geojsonImportAction(body, geoSystemeId)

    return Promise.reject(new Error('plop'))
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
const onPointsChange = (geojson4326Points: FeatureCollectionPoints) => {
  onPointsChangeAction(geojson4326Points)
}
const etapeNoHeritage: Props['etape'] = {
  typeId: 'mfr',
  heritageProps: { perimetre: { actif: false } },
  geojson4326Perimetre: null,
  geojson4326Points: null,
  geojsonOriginePerimetre: null,
  geojsonOriginePoints: null,
  geojsonOrigineGeoSystemeId: null,
  surface: null,
}

const titreSlug = titreSlugValidator.parse('titre-slug')
export const EmptyNoHeritage: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    apiClient={apiClient}
    etape={etapeNoHeritage}
    titreTypeId="arm"
    titreSlug={titreSlug}
    completeUpdate={completeUpdate}
    onEtapeChange={onEtapeChange}
    onPointsChange={onPointsChange}
  />
)
const etapeEmptyHeritage: Props['etape'] = {
  ...etapeNoHeritage,
  typeId: 'dpu',
  heritageProps: { perimetre: { actif: true, etape: { date: toCaminoDate('2023-01-01'), typeId: EtapesTypes.mfr.id, geojson4326Perimetre: null, geojson4326Points: null, surface: null } } },
}
export const EmptyHeritage: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    completeUpdate={completeUpdate}
    onEtapeChange={onEtapeChange}
    apiClient={apiClient}
    etape={etapeEmptyHeritage}
    titreTypeId="arm"
    titreSlug={titreSlug}
    onPointsChange={onPointsChange}
  />
)

const etapeHeritage: Props['etape'] = {
  ...etapeEmptyHeritage,
  heritageProps: {
    perimetre: {
      actif: true,
      etape: {
        date: toCaminoDate('2023-01-01'),
        typeId: EtapesTypes.mfr.id,
        surface: km2Validator.parse(2),
        geojson4326Perimetre: perimetre,
        geojson4326Points: null,
        geojsonOriginePerimetre: perimetre,
        geojsonOriginePoints: null,
        geojsonOrigineGeoSystemeId: '4326',
      },
    },
  },
}
export const Heritage: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    completeUpdate={completeUpdate}
    onEtapeChange={onEtapeChange}
    apiClient={apiClient}
    etape={etapeHeritage}
    titreTypeId="arm"
    titreSlug={titreSlug}
    onPointsChange={onPointsChange}
  />
)

const etape: Props['etape'] = {
  ...etapeEmptyHeritage,
  geojson4326Perimetre: perimetre,
  surface: km2Validator.parse(2),
  geojsonOriginePerimetre: perimetre,
  geojsonOriginePoints: null,
  geojsonOrigineGeoSystemeId: '4326',
  heritageProps: { perimetre: { actif: false } },
}
export const FilledNoHeritage: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    completeUpdate={completeUpdate}
    onEtapeChange={onEtapeChange}
    apiClient={apiClient}
    etape={etape}
    titreTypeId="arm"
    titreSlug={titreSlug}
    onPointsChange={onPointsChange}
  />
)

const etapeLegacy: Props['etape'] = {
  ...etapeEmptyHeritage,
  geojson4326Perimetre: perimetre,
  surface: km2Validator.parse(2),
  geojsonOriginePerimetre: perimetre,
  geojsonOriginePoints: null,
  geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.RGFG95,
  heritageProps: { perimetre: { actif: false } },
}
export const LegacyGeoSysteme: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    completeUpdate={completeUpdate}
    onEtapeChange={onEtapeChange}
    apiClient={apiClient}
    etape={etapeLegacy}
    titreTypeId="arm"
    titreSlug={titreSlug}
    onPointsChange={onPointsChange}
  />
)
