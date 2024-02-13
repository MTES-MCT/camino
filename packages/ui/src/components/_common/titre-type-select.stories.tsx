import { action } from '@storybook/addon-actions'
import { TitreTypeSelect } from './titre-type-select'
import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Common/TitreTypeSelect',
  component: TitreTypeSelect,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const onUpdateTitreTypeIdAction = action('onUpdateTitreTypeId')

export const Default: StoryFn = () => <TitreTypeSelect user={{ role: 'super', ...testBlankUser }} onUpdateTitreTypeId={onUpdateTitreTypeIdAction} titreTypeId={null} />

export const Entreprise: StoryFn = () => <TitreTypeSelect user={{ role: 'entreprise', entreprises: [], ...testBlankUser }} onUpdateTitreTypeId={onUpdateTitreTypeIdAction} titreTypeId={null} />



export const AlreadySelected: StoryFn = () => <TitreTypeSelect user={{ role: 'entreprise', entreprises: [], ...testBlankUser }} onUpdateTitreTypeId={onUpdateTitreTypeIdAction} titreTypeId={'arm'} />