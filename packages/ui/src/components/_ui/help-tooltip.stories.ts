import { Meta } from '@storybook/vue3'
import HelpTooltip from './help-tooltip.vue'

const meta: Meta = {
  title: 'Ui/HelpTooltip',
  component: HelpTooltip
}
export default meta

export const Simple = () => ({
  components: { HelpTooltip },
  template: `<HelpTooltip>Tooltip text</HelpTooltip>`
})

export const WithDifferentIcon = () => ({
  components: { HelpTooltip },
  template: `<HelpTooltip icon="download">Tooltip text</HelpTooltip>`
})
