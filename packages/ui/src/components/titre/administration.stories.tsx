import { PureAdministration } from './administration'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Titre/Administration',
  component: PureAdministration,
}
export default meta

const eventTrack = action('eventTrack')

export const Default: Story = () => <PureAdministration administrationId="aut-mrae-guyane-01" eventTrack={eventTrack} />

export const WithServiceAndEmail: Story = () => <PureAdministration administrationId="min-mtes-dgaln-01" eventTrack={eventTrack} />
