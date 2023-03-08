import { DGTMStatsFull } from './dgtm-stats-full'
import { Meta, Story } from '@storybook/vue3'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { statistiquesDGTMFake } from './testData'

const meta: Meta = {
  title: 'Components/Dashboard/DGTMStatsFull',
  component: DGTMStatsFull,
  argTypes: {
    getEntreprisesTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' },
  },
}
export default meta

export const OkNoSnapshot: Story = () => <DGTMStatsFull getDgtmStats={() => Promise.resolve(statistiquesDGTMFake)} />
export const Loading: Story = () => <DGTMStatsFull getDgtmStats={() => new Promise<StatistiquesDGTM>(resolve => {})} />
export const WithError: Story = () => <DGTMStatsFull getDgtmStats={() => Promise.reject(new Error('because reasons'))} />
