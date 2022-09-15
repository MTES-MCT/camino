import PureDrealDashboard from './pure-dreal-dashboard.vue'
import { Meta, Story } from '@storybook/vue3'
import { CommonTitreDREAL } from 'camino-common/src/titres'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { statistiquesDGTMFake, titresDreal } from './testData'
const meta: Meta = {
  title: 'Components/NoStoryshots/PureDrealDashboard',
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

export const OkDGTM = Template.bind({ title: 'Components/Plop' })
OkDGTM.args = {
  getDrealTitres: () => Promise.resolve(titresDreal),
  isDGTM: true,
  getDgtmStats: () => Promise.resolve(statistiquesDGTMFake)
}
