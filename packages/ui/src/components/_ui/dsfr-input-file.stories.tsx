import { InputFile } from './dsfr-input-file'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Dsfr/InputFile',
  component: InputFile,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta
const uploadFile = action('uploadFile')

export const PdfOnly: StoryFn = () => <InputFile accept={['pdf']} uploadFile={uploadFile} />
export const ManyFormats: StoryFn = () => <InputFile accept={['pdf', 'doc', 'docx']} uploadFile={uploadFile} />
