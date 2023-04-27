import { Administration } from './administration'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Titre/Administration',
  component: Administration,
}
export default meta

const onEventTrack = action('onEventTrack')

export const Default: StoryFn = () => <Administration administrationId="aut-mrae-guyane-01" onEventTrack={onEventTrack} />

export const WithServiceAndEmail: StoryFn = () => <Administration administrationId="min-mtes-dgaln-01" onEventTrack={onEventTrack} />
