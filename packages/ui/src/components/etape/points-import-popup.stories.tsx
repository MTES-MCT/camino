import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { PointsImportPopup } from './points-import-popup'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'

const meta: Meta = {
  title: 'Components/Etape/ImportPoint',
  component: PointsImportPopup,
}
export default meta

const close = action('close')
const importAction = action('import')

const pointsImport = async (file: File, geoSystemeId: GeoSystemeId) => {
  importAction(file, geoSystemeId)
}

export const Default: StoryFn = () => <PointsImportPopup close={close} pointsImport={pointsImport} />
