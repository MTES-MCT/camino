import { action } from '@storybook/addon-actions'
import { TitreTypeSelect } from './titre-type-select'
import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Common/TitreTypeSelect',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: TitreTypeSelect,
}
export default meta

const onUpdateTitreTypeIdAction = action('onUpdateTitreTypeId')

export const Default: StoryFn = () => <TitreTypeSelect user={{ role: 'super', ...testBlankUser }} onUpdateTitreTypeId={onUpdateTitreTypeIdAction} titreTypeId={null} />

export const Entreprise: StoryFn = () => <TitreTypeSelect user={{ role: 'entreprise', entreprises: [], ...testBlankUser }} onUpdateTitreTypeId={onUpdateTitreTypeIdAction} titreTypeId={null} />

export const AlreadySelected: StoryFn = () => <TitreTypeSelect user={{ role: 'entreprise', entreprises: [], ...testBlankUser }} onUpdateTitreTypeId={onUpdateTitreTypeIdAction} titreTypeId={'arm'} />
