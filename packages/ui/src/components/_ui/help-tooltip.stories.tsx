import { Meta, Story } from '@storybook/vue3'
import { HelpTooltip } from './help-tooltip'

const meta: Meta = {
  title: 'Components/Ui/HelpTooltip',
  component: HelpTooltip,
}
export default meta

export const Simple: Story = () => <HelpTooltip text="Tooltip text" />
export const WithDifferentIcon: Story = () => <HelpTooltip icon="download" text="Tooltip text" />
