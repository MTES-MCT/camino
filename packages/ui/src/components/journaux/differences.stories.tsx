import { Differences } from './differences'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Journaux/Differences',
  component: Differences,
}
export default meta

export const Create: StoryFn = () => <Differences journal={{ elementId: 'elementId', operation: 'create' }} />
export const Update: StoryFn = () => <Differences journal={{ elementId: 'id', operation: 'update', differences: { statutId: ['aco', 'fai'] } }} />
