import { InputFile } from './dsfr-input-file'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Dsfr/InputFile',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: InputFile,
}
export default meta
const uploadFile = action('uploadFile')

export const PdfOnly: StoryFn = () => <InputFile required={false} accept={['pdf']} uploadFile={uploadFile} />
export const ManyFormats: StoryFn = () => <InputFile required={false} accept={['pdf', 'csv']} uploadFile={uploadFile} />
export const Required: StoryFn = () => <InputFile required={true} accept={['pdf', 'csv']} uploadFile={uploadFile} />
