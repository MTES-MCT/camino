import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { DocumentTypeTypeahead } from './document-type-typeahead'

const meta: Meta = {
  title: 'Components/Common/DocumentTypeTypeahead',
  // @ts-ignore
  component: DocumentTypeTypeahead,
}
export default meta

const documentTypeIdSelected = action('documentTypeIdSelected')

export const Default: StoryFn = () => <DocumentTypeTypeahead documentTypeIds={['car', 'doe']} documentTypeIdSelected={documentTypeIdSelected} alwaysOpen={true} />
export const WithDocumentTypeAlreadySelected: StoryFn = () => <DocumentTypeTypeahead documentTypeIds={['car', 'doe']} initialValue='car' documentTypeIdSelected={documentTypeIdSelected} />
