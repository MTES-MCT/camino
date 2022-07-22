import PureEntrepriseFiscalite from './pure-entreprise-fiscalite.vue'
import { Meta, Story } from '@storybook/vue3'
import { Fiscalite } from 'camino-common/src/fiscalite'

const meta: Meta = {
  title: 'Components/PureEntrepriseFiscalite',
  component: PureEntrepriseFiscalite,
  argTypes: {}
}
export default meta

type Props = {
  getFiscaliteEntreprise: () => Promise<Fiscalite>
}

const Template: Story<Props> = (args: Props) => ({
  components: { PureEntrepriseFiscalite },
  setup() {
    return { args }
  },
  template: '<PureEntrepriseFiscalite v-bind="args" />'
})

export const Ok = Template.bind({})
Ok.args = {
  getFiscaliteEntreprise: () =>
    Promise.resolve({
      redevanceCommunale: 1600.071,
      redevanceDepartementale: 330.98
    })
}
export const Guyane = Template.bind({})
Guyane.args = {
  getFiscaliteEntreprise: () =>
    Promise.resolve({
      redevanceCommunale: 1600.071,
      redevanceDepartementale: 330.98,
      guyane: {
        taxeAurifereBrute: 4100,
        totalInvestissementsDeduits: 100,
        taxeAurifere: 210
      }
    })
}

export const Loading = Template.bind({})
Loading.args = {
  getFiscaliteEntreprise: () => new Promise<Fiscalite>(resolve => {})
}
export const WithError = Template.bind({})
WithError.args = {
  getFiscaliteEntreprise: () => Promise.reject(new Error('because reasons'))
}
