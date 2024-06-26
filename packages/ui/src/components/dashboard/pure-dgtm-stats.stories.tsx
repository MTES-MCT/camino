import { PureDGTMStats } from './pure-dgtm-stats'
import { Meta, StoryFn } from '@storybook/vue3'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { statistiquesDGTMFake } from './testData'

const meta: Meta = {
  title: 'Components/Dashboard/DGTMStats',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: PureDGTMStats,
  argTypes: {
    getEntreprisesTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' },
  },
}
export default meta

export const OkNoSnapshot: StoryFn = () => <PureDGTMStats apiClient={{ getDgtmStats: () => Promise.resolve(statistiquesDGTMFake) }} />
export const Loading: StoryFn = () => <PureDGTMStats apiClient={{ getDgtmStats: () => new Promise<StatistiquesDGTM>(_resolve => {}) }} />
export const WithError: StoryFn = () => <PureDGTMStats apiClient={{ getDgtmStats: () => Promise.reject(new Error('because reasons')) }} />
