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

export const Ok = Template.bind(
  {},
  {
    getDrealTitres: () => Promise.resolve(titresDreal),
    isDGTM: false,
    getDgtmStats: () =>
      Promise.resolve({
        depotEtInstructions: {},
        sdom: {},
        delais: {},
        avisAXM: {},
        producteursOr: {}
      })
  }
)

export const Loading = Template.bind(
  {},
  {
    getDrealTitres: () => new Promise<CommonTitreDREAL[]>(_resolve => {}),
    isDGTM: false,
    getDgtmStats: () =>
      Promise.resolve({
        depotEtInstructions: {},
        sdom: {},
        delais: {},
        avisAXM: {},
        producteursOr: {}
      })
  }
)
export const WithError = Template.bind(
  {},
  {
    getDrealTitres: () => Promise.reject(new Error('because reasons')),
    isDGTM: false,
    getDgtmStats: () =>
      Promise.resolve({
        depotEtInstructions: {},
        sdom: {},
        delais: {},
        avisAXM: {},
        producteursOr: {}
      })
  }
)
