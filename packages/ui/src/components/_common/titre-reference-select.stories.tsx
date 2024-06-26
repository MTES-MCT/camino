import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { TitreReferenceSelect } from './titre-reference-select'

const meta: Meta = {
  title: 'Components/Common/TitreReferenceSelect',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: TitreReferenceSelect,
}
export default meta

const onUpdateReferencesAction = action('onUpdateReferences')

export const Default: StoryFn = () => <TitreReferenceSelect onUpdateReferences={onUpdateReferencesAction} />

export const WithValues: StoryFn = () => (
  <TitreReferenceSelect
    onUpdateReferences={onUpdateReferencesAction}
    initialValues={[
      { referenceTypeId: 'brg', nom: 'REF1' },
      { referenceTypeId: 'dea', nom: 'REF2' },
    ]}
  />
)
