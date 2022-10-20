import PureTitresTypes from './pure-titres-types.vue'
import { Meta, Story } from '@storybook/vue3'
import {
  AdministrationId,
  ADMINISTRATION_IDS
} from 'camino-common/src/static/administrations'

const meta: Meta = {
  title: 'Components/Administration/TitresTypes',
  component: PureTitresTypes
}
export default meta

type Props = {
  administrationId: AdministrationId
}

const Template: Story<Props> = (args: Props) => ({
  components: { PureTitresTypes },
  setup() {
    return { args }
  },
  template: '<PureTitresTypes v-bind="args" />'
})

export const ONF = Template.bind({})
ONF.args = {
  administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
}
