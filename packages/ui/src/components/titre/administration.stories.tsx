import { Administration } from './administration'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Titre/Administration',
  component: Administration,
}
export default meta

const onEventTrack = action('onEventTrack')

export const Default: Story = () => <Administration administrationId="aut-mrae-guyane-01" onEventTrack={onEventTrack} />

export const WithServiceAndEmail: Story = () => <Administration administrationId="min-mtes-dgaln-01" onEventTrack={onEventTrack} />
