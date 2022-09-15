import PureDGTMStats from './pure-dgtm-stats.vue'
import { Meta, Story } from '@storybook/vue3'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { statistiquesDGTMFake } from './testData'

const meta: Meta = {
  title: 'Components/PureDGTMStats',
  component: PureDGTMStats,
  argTypes: {
    getEntreprisesTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' }
  }
}
export default meta

type Props = {
  getDgtmStats: () => Promise<StatistiquesDGTM>
}

const Template: Story<Props> = (args: Props) => ({
  components: { PureDGTMStats },
  setup() {
    return { args }
  },
  template: '<PureDGTMStats v-bind="args" />'
})

export const Ok = Template.bind({})
Ok.args = {
  getDgtmStats: () => Promise.resolve(statistiquesDGTMFake)
}

export const Loading = Template.bind({})
Loading.args = {
  getDgtmStats: () => new Promise<StatistiquesDGTM>(resolve => {})
}
export const WithError = Template.bind({})
WithError.args = {
  getDgtmStats: () => Promise.reject(new Error('because reasons'))
}
