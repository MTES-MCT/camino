import { Meta, StoryFn } from '@storybook/vue3'
import { HelpTooltip } from './help-tooltip'

const meta: Meta = {
  title: 'Components/Ui/HelpTooltip',
  component: HelpTooltip,
}
export default meta

export const Simple: StoryFn = () => <HelpTooltip text="Tooltip text" />
export const WithDifferentIcon: StoryFn = () => <HelpTooltip icon="download" text="Tooltip text" />
