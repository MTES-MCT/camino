import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { ApiClient } from '@/api/api-client'
import { FeatureCollectionForages, FeatureCollectionPoints, FeatureMultiPolygon, GeojsonInformations } from 'camino-common/src/perimetre'
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
}
export default meta

const geojsonImportAction = action('geojsonImport')
const uploadTempDocumentAction = action('uploadTempDocumentAction')
const onEtapeChangeAction = action('onEtapeChange')
const onPointsChangeAction = action('onPointsChange')
const onForagesChangeAction = action('onForagesChange')
const onHeritageChangeAction = action('onHeritageChange')

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

const apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport' | 'geojsonPointsImport' | 'geojsonForagesImport'> = {
  geojsonImport(body, geoSystemeId) {
    geojsonImportAction(body, geoSystemeId)

    return Promise.reject(new Error('plop'))
  },
  geojsonPointsImport(body, geoSystemeId) {
    geojsonImportAction(body, geoSystemeId)

    return Promise.reject(new Error('plop'))
  },
  geojsonForagesImport(body, geoSystemeId) {
    geojsonImportAction(body, geoSystemeId)

    return Promise.reject(new Error('plop'))
  },
  uploadTempDocument(document) {
    uploadTempDocumentAction(document)

    return Promise.resolve(tempDocumentNameValidator.parse('name'))
  },
}

const onEtapeChange = (geojsonInformations: GeojsonInformations) => {
  onEtapeChangeAction(geojsonInformations)
}
const onPointsChange = (geojson4326Points: FeatureCollectionPoints) => {
  onPointsChangeAction(geojson4326Points)
}
const onForagesChange = (geojson4326Forages: FeatureCollectionForages) => {
  onForagesChangeAction(geojson4326Forages)
}
const onHeritageChange = (heritage: Props['etape']['perimetre']) => {
  onHeritageChangeAction(heritage)
}
const etapeNoHeritage: Props['etape'] = {
  perimetre: {
    value: {
      geojson4326Perimetre: null,
      geojson4326Points: null,
      geojsonOriginePerimetre: null,
      geojsonOriginePoints: null,
      geojsonOrigineGeoSystemeId: null,
      geojson4326Forages: null,
      geojsonOrigineForages: null,
      surface: null,
    },
    heritee: false,
    etapeHeritee: null,
  },
}

const titreSlug = titreSlugValidator.parse('titre-slug')
export const EmptyNoHeritage: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    apiClient={apiClient}
    etape={etapeNoHeritage}
    titreTypeId="arm"
    titreSlug={titreSlug}
    onEtapeChange={onEtapeChange}
    onPointsChange={onPointsChange}
    onForagesChange={onForagesChange}
    onHeritageChange={onHeritageChange}
  />
)
const etapeEmptyHeritage: Props['etape'] = {
  perimetre: {
    value: {
      geojson4326Perimetre: null,
      geojson4326Points: null,
      geojsonOriginePerimetre: null,
      geojsonOriginePoints: null,
      geojsonOrigineGeoSystemeId: null,
      geojson4326Forages: null,
      geojsonOrigineForages: null,
      surface: null,
    },
    heritee: true,
    etapeHeritee: {
      date: toCaminoDate('2023-01-01'),
      etapeTypeId: EtapesTypes.mfr.id,
      value: null,
    },
  },
}
export const EmptyHeritage: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    onEtapeChange={onEtapeChange}
    apiClient={apiClient}
    etape={etapeEmptyHeritage}
    titreTypeId="arm"
    titreSlug={titreSlug}
    onPointsChange={onPointsChange}
    onForagesChange={onForagesChange}
    onHeritageChange={onHeritageChange}
  />
)

const etapeHeritage: Props['etape'] = {
  perimetre: {
    value: {
      geojson4326Perimetre: null,
      geojson4326Points: null,
      geojsonOriginePerimetre: null,
      geojsonOriginePoints: null,
      geojsonOrigineGeoSystemeId: null,
      geojson4326Forages: null,
      geojsonOrigineForages: null,
      surface: null,
    },
    heritee: true,
    etapeHeritee: {
      date: toCaminoDate('2023-01-01'),
      etapeTypeId: EtapesTypes.mfr.id,
      value: {
        surface: km2Validator.parse(2),
        geojson4326Perimetre: perimetre,
        geojson4326Points: null,
        geojsonOriginePerimetre: perimetre,
        geojsonOriginePoints: null,
        geojsonOrigineGeoSystemeId: '4326',
        geojson4326Forages: null,
        geojsonOrigineForages: null,
      },
    },
  },
}
export const Heritage: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    onEtapeChange={onEtapeChange}
    apiClient={apiClient}
    etape={etapeHeritage}
    titreTypeId="arm"
    titreSlug={titreSlug}
    onPointsChange={onPointsChange}
    onForagesChange={onForagesChange}
    onHeritageChange={onHeritageChange}
  />
)

const etape: Props['etape'] = {
  perimetre: {
    value: {
      geojson4326Points: null,
      geojson4326Forages: null,
      geojsonOrigineForages: null,
      geojson4326Perimetre: perimetre,
      surface: km2Validator.parse(2),
      geojsonOriginePerimetre: perimetre,
      geojsonOriginePoints: null,
      geojsonOrigineGeoSystemeId: '4326',
    },
    heritee: false,
    etapeHeritee: null,
  },
}
export const FilledNoHeritage: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    onEtapeChange={onEtapeChange}
    apiClient={apiClient}
    etape={etape}
    titreTypeId="arm"
    titreSlug={titreSlug}
    onPointsChange={onPointsChange}
    onForagesChange={onForagesChange}
    onHeritageChange={onHeritageChange}
  />
)

const etapeLegacy: Props['etape'] = {
  perimetre: {
    value: {
      geojson4326Points: null,
      geojson4326Forages: null,
      geojsonOrigineForages: null,
      geojson4326Perimetre: perimetre,
      surface: km2Validator.parse(2),
      geojsonOriginePerimetre: perimetre,
      geojsonOriginePoints: null,
      geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.RGFG95,
    },
    heritee: false,
    etapeHeritee: null,
  },
}
export const LegacyGeoSysteme: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    onEtapeChange={onEtapeChange}
    apiClient={apiClient}
    etape={etapeLegacy}
    titreTypeId="arm"
    titreSlug={titreSlug}
    onPointsChange={onPointsChange}
    onForagesChange={onForagesChange}
    onHeritageChange={onHeritageChange}
  />
)

const geojsonForages: FeatureCollectionForages = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [4.821788094643814, 45.725204601507926],
      },
      properties: {
        nom: 'A',
        type: 'rejet',
        profondeur: 3,
        description: 'ceci est une description',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [4.823550614394235, 45.725288143217156],
      },
      properties: {
        nom: 'B',
        type: 'captage',
        profondeur: 4,
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [4.823866086187904, 45.725152316677836],
      },
      properties: {
        nom: 'D',
        type: 'rejet',
        profondeur: 10,
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [4.823173965600932, 45.721951486049164],
      },
      properties: {
        nom: 'X',
        type: 'piézomètre',
        profondeur: 52,
      },
    },
  ],
}

const perimetreForages: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [4.822103744867218, 45.726602759388356],
          [4.820457868136398, 45.72661133750498],
          [4.822001395399144, 45.71998407507634],
          [4.822271981827943, 45.71961040284889],
          [4.823443813756128, 45.72005082114589],
          [4.828145558734241, 45.722631804228726],
          [4.827027831384014, 45.723442567682575],
          [4.827092269107372, 45.724225156310794],
          [4.8242350940655605, 45.72649622899734],
          [4.822103744867218, 45.726602759388356],
        ],
      ],
    ],
  },
}

const etapeWithForages: Props['etape'] = {
  perimetre: {
    value: {
      geojson4326Points: null,
      geojson4326Perimetre: perimetreForages,
      surface: km2Validator.parse(2),
      geojsonOriginePerimetre: perimetreForages,
      geojsonOriginePoints: null,
      geojsonOrigineGeoSystemeId: '4326',
      geojson4326Forages: geojsonForages,
      geojsonOrigineForages: geojsonForages,
    },
    heritee: false,
    etapeHeritee: null,
  },
}
export const WithForages: StoryFn = () => (
  <PerimetreEdit
    initTab="points"
    onEtapeChange={onEtapeChange}
    apiClient={apiClient}
    etape={etapeWithForages}
    titreTypeId="pxg"
    titreSlug={titreSlug}
    onPointsChange={onPointsChange}
    onForagesChange={onForagesChange}
    onHeritageChange={onHeritageChange}
  />
)
