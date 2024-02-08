import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { PerimetreImportPopup } from './perimetre-import-popup'
import { ApiClient } from '@/api/api-client'
import { GeojsonInformations } from 'camino-common/src/perimetre'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { km2Validator } from 'camino-common/src/number'

const meta: Meta = {
  title: 'Components/Etape/ImportPerimetre',
  component: PerimetreImportPopup,
}
export default meta

const close = action('close')
const geojsonImportAction = action('geojsonImport')
const geojsonImport = action('geojsonImport')
const resultAction = action('resultAction')

const apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport'> = {
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
    geojsonImport(document)

    return Promise.resolve(tempDocumentNameValidator.parse('name'))
  },
}

export const Default: StoryFn = () => <PerimetreImportPopup close={close} apiClient={apiClient} result={resultAction} titreSlug={titreSlugValidator.parse('titreslug')} titreTypeId="arm" />
