import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { ApiClient } from '@/api/api-client'
import { FeatureCollectionForages } from 'camino-common/src/perimetre'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { ForagesImportPopup } from './forages-import-popup'

const meta: Meta = {
  title: 'Components/Etape/ImportForages',
  component: ForagesImportPopup,
}
export default meta

const close = action('close')
const geojsonForagesImportAction = action('geojsonForagesImport')
const geojsonImport = action('geojsonImport')
const resultAction = action('resultAction')

const apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonForagesImport'> = {
  geojsonForagesImport(body, geoSystemeId) {
    geojsonForagesImportAction(body, geoSystemeId)
    const result: FeatureCollectionForages = {
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

export const Default: StoryFn = () => <ForagesImportPopup close={close} apiClient={apiClient} result={resultAction} geoSystemeId="2154" />
