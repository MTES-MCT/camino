import { PureDGTMStats } from './pure-dgtm-stats'
import { Meta, Story } from '@storybook/vue3'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { statistiquesDGTMFake } from './testData'

const meta: Meta = {
  title: 'Components/Dashboard/DGTMStats',
  component: PureDGTMStats,
  argTypes: {
    getEntreprisesTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' }
  }
}
export default meta

export const OkNoSnapshot: Story = () => (
  <PureDGTMStats getDgtmStats={() => Promise.resolve(statistiquesDGTMFake)} />
)
export const Loading: Story = () => (
  <PureDGTMStats
    getDgtmStats={() => new Promise<StatistiquesDGTM>(resolve => {})}
  />
)
export const WithError: Story = () => (
  <PureDGTMStats
    getDgtmStats={() => Promise.reject(new Error('because reasons'))}
  />
)
