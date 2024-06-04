import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { TypeaheadSmartSingle } from '../_ui/typeahead-smart-single'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes'

const meta: Meta = {
  title: 'Components/Common/DocumentTypeTypeahead',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: TypeaheadSmartSingle,
}
export default meta

const documentTypeIdSelected = action('documentTypeIdSelected')

export const Default: StoryFn = () => <TypeaheadSmartSingle possibleValues={[DocumentsTypes.car, DocumentsTypes.doe]} valueIdSelected={documentTypeIdSelected} alwaysOpen={true} />
export const WithDocumentTypeAlreadySelected: StoryFn = () => (
  <TypeaheadSmartSingle possibleValues={[DocumentsTypes.car, DocumentsTypes.doe]} initialValue="car" valueIdSelected={documentTypeIdSelected} />
)
