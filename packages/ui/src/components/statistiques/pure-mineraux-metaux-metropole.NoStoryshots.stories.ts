import PureMinerauxMetauxMetropole from './pure-mineraux-metaux-metropole.vue'
import { Meta, Story } from '@storybook/vue3'
import { StatistiquesMinerauxMetauxMetropole } from 'camino-common/src/statistiques'

const meta: Meta = {
  title: 'Components/NoStoryshots/Statistiques/MinerauxMetauxMetropole',
  component: PureMinerauxMetauxMetropole,
  argTypes: {}
}
export default meta

type Props = { getStats: () => Promise<StatistiquesMinerauxMetauxMetropole> }

const Template: Story<Props> = (args: Props) => ({
  components: { PureMinerauxMetauxMetropole },
  setup() {
    return { args }
  },

  template: '<PureMinerauxMetauxMetropole v-bind="args" />'
})

export const Default = Template.bind({})
Default.args = {
  getStats: () =>
    Promise.resolve({
      surfaceExploitation: 21314,
      surfaceExploration: 297966,
      titres: {
        instructionExploitation: 1,
        instructionExploration: 11,
        valCxm: 20,
        valPrm: 3
      }
    })
}

export const Loading = Template.bind({})
Loading.args = {
  getStats: () =>
    new Promise<StatistiquesMinerauxMetauxMetropole>(resolve => {})
}

export const WithError = Template.bind({})
WithError.args = {
  getStats: () => Promise.reject(new Error('because reasons'))
}
