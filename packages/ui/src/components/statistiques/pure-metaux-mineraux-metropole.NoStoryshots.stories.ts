import PureMetauxMinerauxMetropole from './pure-metaux-mineraux-metropole.vue'
import { Meta, Story } from '@storybook/vue3'
import { StatistiquesMetauxMinerauxMetropole } from 'camino-common/src/statistiques'

const meta: Meta = {
  title: 'Components/NoStoryshots/Statistiques/MetauxMinerauxMetropole',
  component: PureMetauxMinerauxMetropole,
  argTypes: {}
}
export default meta

type Props = { getStats: () => Promise<StatistiquesMetauxMinerauxMetropole> }

const Template: Story<Props> = (args: Props) => ({
  components: { PureMetauxMinerauxMetropole },
  setup() {
    return { args }
  },

  template: '<PureMetauxMinerauxMetropole v-bind="args" />'
})

export const Default = Template.bind({})
Default.args = {
  getStats: () => Promise.resolve({})
}

export const Loading = Template.bind({})
Loading.args = {
  getStats: () =>
    new Promise<StatistiquesMetauxMinerauxMetropole[]>(resolve => {})
}

export const WithError = Template.bind({})
WithError.args = {
  getStats: () => Promise.reject(new Error('because reasons'))
}
