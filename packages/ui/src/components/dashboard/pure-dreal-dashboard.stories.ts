import PureDrealDashboard from './pure-dreal-dashboard.vue'
import { Meta, Story } from '@storybook/vue3'
import { CommonTitreDREAL } from 'camino-common/src/titres'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { titresDreal } from './testData'
const meta: Meta = {
  title: 'Components/PureDrealDashboard',
  component: PureDrealDashboard,
  argTypes: {
    getEntreprisesTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' }
  }
}
export default meta

type Props = {
  getDrealTitres: () => Promise<CommonTitreDREAL[]>
  isDGTM: boolean
  getDgtmStats: () => Promise<StatistiquesDGTM>
}

const Template: Story<Props> = (args: Props) => ({
  components: { PureDrealDashboard },
  setup() {
    return { args }
  },
  template: '<PureDrealDashboard v-bind="args" />'
})

export const Ok = Template.bind({})
Ok.args = {
  getDrealTitres: () => Promise.resolve(titresDreal),
  isDGTM: false,
  getDgtmStats: () =>
    Promise.resolve({ depotEtInstructions: {}, sdom: {}, delais: {} })
}

export const Loading = Template.bind({})
Loading.args = {
  getDrealTitres: () => new Promise<CommonTitreDREAL[]>(resolve => {}),
  isDGTM: false,
  getDgtmStats: () =>
    Promise.resolve({ depotEtInstructions: {}, sdom: {}, delais: {} })
}
export const WithError = Template.bind({})
WithError.args = {
  getDrealTitres: () => Promise.reject(new Error('because reasons')),
  isDGTM: false,
  getDgtmStats: () =>
    Promise.resolve({ depotEtInstructions: {}, sdom: {}, delais: {} })
}
