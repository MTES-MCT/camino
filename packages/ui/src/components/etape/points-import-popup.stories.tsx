import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { ApiClient } from '@/api/api-client'
import { FeatureCollectionPoints } from 'camino-common/src/perimetre'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { PointsImportPopup } from './points-import-popup'

const meta: Meta = {
  title: 'Components/Etape/ImportPoints',
  component: PointsImportPopup,
}
export default meta

const close = action('close')
const geojsonPointsImportAction = action('geojsonPointsImport')
const geojsonImport = action('geojsonImport')
const resultAction = action('resultAction')

const apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonPointsImport'> = {
  geojsonPointsImport(body, geoSystemeId) {
    geojsonPointsImportAction(body, geoSystemeId)
    const result: FeatureCollectionPoints = {
      features: [],
      type: 'FeatureCollection',
    }

    return Promise.resolve({ geojson4326: result, origin: result })
  },
  uploadTempDocument(document) {
    geojsonImport(document)

    return Promise.resolve(tempDocumentNameValidator.parse('name'))
  },
}

export const Default: StoryFn = () => <PointsImportPopup close={close} apiClient={apiClient} result={resultAction} geoSystemeId="2154" />
