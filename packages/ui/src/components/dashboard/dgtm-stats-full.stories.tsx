import { DGTMStatsFull } from './dgtm-stats-full'
import { Meta, StoryFn } from '@storybook/vue3'
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

export const OkNoSnapshot: StoryFn = () => <DGTMStatsFull getDgtmStats={() => Promise.resolve(statistiquesDGTMFake)} />
export const Loading: StoryFn = () => <DGTMStatsFull getDgtmStats={() => new Promise<StatistiquesDGTM>(_resolve => {})} />
export const WithError: StoryFn = () => <DGTMStatsFull getDgtmStats={() => Promise.reject(new Error('because reasons'))} />
